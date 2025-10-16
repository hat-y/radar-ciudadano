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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find({ where: { deleted: false } });
    } catch (error) {
      throw new BadRequestException('Error fetching users');
    }
  }

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
}
