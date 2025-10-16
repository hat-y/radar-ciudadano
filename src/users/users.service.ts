import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
