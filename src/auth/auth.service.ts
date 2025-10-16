import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    try {
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const newUser = await this.usersService.create(registerDto);
      const accessToken = await this.generateJwtToken(newUser);

      // Remove password from response
      delete (newUser as any).password;

      return { user: newUser, accessToken };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error during registration');
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string }> {
    try {
      const user = await this.usersService.findByEmail(loginDto.email, true); // true to select password
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await user.comparePassword(loginDto.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = await this.generateJwtToken(user);
      
      // Remove password from response
      delete (user as any).password;

      return { user, accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error during login');
    }
  }

  private async generateJwtToken(user: User): Promise<string> {
    try {
      const payload = { email: user.email, sub: user.id };
      const secret = this.configService.get<string>('JWT_SECRET');
      
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      return this.jwtService.sign(payload, {
        secret,
        expiresIn: '1h',
      });
    } catch (error) {
      throw new BadRequestException('Error generating token');
    }
  }
}
