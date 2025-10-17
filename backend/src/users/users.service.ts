import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

// Modulos Internos
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SubscribeToNeighborhoodDto } from './dto/subscribe-neighborhood.dto';
import { NeighborhoodSubscription } from './entities/neighborhood-subscription.entity';
import { GeospatialService } from '../reports/geospatial.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(NeighborhoodSubscription)
    private subscriptionRepository: Repository<NeighborhoodSubscription>,
    private geospatialService: GeospatialService,
  ) {}

  /**
   * Busca un usuario por email
   * @param email Email del usuario
   * @param withPassword Si debe incluir la contraseña en el resultado
   * @returns El usuario o null si no se encuentra
   */
  async findByEmail(email: string, withPassword = false): Promise<User | null> {
    try {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');
      if (withPassword) {
        queryBuilder.addSelect('user.password');
      }
      return queryBuilder.where('user.email = :email', { email }).getOne();
    } catch (error) {
      throw new BadRequestException('Error finding user by email');
    }
  }

  /**
   * Obtiene todos los usuarios no eliminados
   * @returns Todos los usuarios no eliminados
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find({ where: { deleted: false } });
    } catch (error) {
      throw new BadRequestException('Error fetching users');
    }
  }

  /**
   * Busca un usuario por ID
   * @param id ID del usuario
   * @returns El usuario o lanza excepción si no se encuentra
   */
  async findOne(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ id, deleted: false });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error finding user');
    }
  }

  /**
   * Crea un nuevo usuario
   * @param createUserDto Datos del usuario
   * @returns El usuario creado
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
      const newUser = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error creating user');
    }
  }

  /**
   * Actualiza un usuario
   * @param id ID del usuario
   * @param updateUserDto Datos del usuario a actualizar
   * @returns El usuario actualizado
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(id);

      // Check if email is being updated and already exists
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.findByEmail(updateUserDto.email);
        if (existingUser) {
          throw new BadRequestException('Email already in use');
        }
      }

      Object.assign(user, updateUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Error updating user');
    }
  }

  /**
   * Elimina un usuario (soft delete)
   * @param id ID del usuario
   * @returns El ID del usuario eliminado
   */
  async remove(id: string): Promise<{ id: string }> {
    try {
      const user = await this.findOne(id);
      await this.usersRepository.update({ id }, { deleted: true });
      return { id };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting user');
    }
  }

   /**
   * Crea un usuario sin contraseña (passwordless) con username anónimo
   */
  async createPasswordlessUser(email: string): Promise<User> {
    try {
      const adjective = faker.word.adjective();
      const noun = faker.word.noun();
      const randomNum = faker.number.int({ min: 100, max: 999 });
      const username = `${adjective}${noun}${randomNum}`.replace(/\s/g, '');
      
      const newUser = this.usersRepository.create({
        email,
        username,
      });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      throw new BadRequestException('Error creating passwordless user');
    }
  }

  /**
   * Busca un usuario por email e incluye el token de login
   */
  async findByEmailWithLoginToken(email: string): Promise<User | null> {
    try {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');
      queryBuilder.addSelect('user.loginToken');
      queryBuilder.addSelect('user.loginTokenExpires');
      return queryBuilder
        .where('user.email = :email', { email })
        .andWhere('user.deleted = :deleted', { deleted: false })
        .getOne();
    } catch (error) {
      throw new BadRequestException('Error finding user by email');
    }
  }

  /**
   * Busca un usuario por token de login
   */
  async findByLoginToken(token: string): Promise<User | null> {
    try {
      const queryBuilder = this.usersRepository.createQueryBuilder('user');
      queryBuilder.addSelect('user.loginToken');
      queryBuilder.addSelect('user.loginTokenExpires');
      return queryBuilder
        .where('user.loginToken = :token', { token })
        .andWhere('user.deleted = :deleted', { deleted: false })
        .getOne();
    } catch (error) {
      throw new BadRequestException('Error finding user by token');
    }
  }

  /**
   * Establece el token de login y su fecha de expiración
   */
  async setLoginToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    try {
      await this.usersRepository.update(userId, {
        loginToken: token,
        loginTokenExpires: expiresAt,
      });
    } catch (error) {
      throw new BadRequestException('Error setting login token');
    }
  }

  /**
   * Limpia el token de login después de usarlo
   */
  async clearLoginToken(userId: string): Promise<void> {
    try {
      await this.usersRepository.update(userId, {
        loginToken: null,
        loginTokenExpires: null,
      });
    } catch (error) {
      throw new BadRequestException('Error clearing login token');
    }
  }

  /**
   * Marca el email del usuario como verificado
   */
  async markEmailAsVerified(userId: string): Promise<void> {
    try {
      await this.usersRepository.update(userId, {
        emailVerified: true,
      });
    } catch (error) {
      throw new BadRequestException('Error marking email as verified');
    }
  }

  /**
   * Suscribir un usuario a notificaciones de un barrio
   */
  async subscribeToNeighborhood(
    userId: string,
    dto: SubscribeToNeighborhoodDto,
  ) {
    // Verificar que el usuario existe
    const user = await this.findOne(userId);

    // Verificar que el barrio existe
    const neighborhoodExists = await this.geospatialService.neighborhoodExists(dto.neighborhoodName);
    if (!neighborhoodExists) {
      throw new BadRequestException(
        `El barrio "${dto.neighborhoodName}" no existe`,
      );
    }

    // Verificar si ya está suscrito
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        neighborhoodName: dto.neighborhoodName,
      },
    });

    if (existingSubscription) {
      // Actualizar configuración existente
      existingSubscription.emailNotifications =
        dto.emailNotifications ?? existingSubscription.emailNotifications;
      existingSubscription.pushNotifications =
        dto.pushNotifications ?? existingSubscription.pushNotifications;
      return this.subscriptionRepository.save(existingSubscription);
    }

    // Crear nueva suscripción
    const subscription = this.subscriptionRepository.create({
      userId,
      neighborhoodName: dto.neighborhoodName,
      emailNotifications: dto.emailNotifications ?? true,
      pushNotifications: dto.pushNotifications ?? true,
    });

    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Obtener las suscripciones de un usuario
   */
  async getUserSubscriptions(userId: string) {
    await this.findOne(userId); // Verificar que existe
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cancelar suscripción a un barrio
   */
  async unsubscribeFromNeighborhood(
    userId: string,
    subscriptionId: string,
  ) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    await this.subscriptionRepository.remove(subscription);
    return { message: 'Suscripción cancelada exitosamente' };
  }

  /**
   * Obtener lista de barrios disponibles
   */
  async getAvailableNeighborhoods() {
    const neighborhoods = await this.geospatialService.getAllNeighborhoods();
    return {
      neighborhoods,
      total: neighborhoods.length,
    };
  }
}
