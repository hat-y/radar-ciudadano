// Modulos Externos
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Modulos Internos
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RequestLoginDto } from './dto/request-login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Request login - Genera un link y lo envía por email
   */
  async requestLogin(
    requestLoginDto: RequestLoginDto,
  ): Promise<{ message: string }> {
    try {
      const { email } = requestLoginDto;

      this.logger.debug('='.repeat(80));
      this.logger.debug('📩 REQUEST LOGIN');
      this.logger.debug(`Email solicitado: ${email}`);
      this.logger.debug(`Timestamp: ${new Date().toISOString()}`);

      let user = await this.usersService.findByEmail(email);

      if (!user) {
        this.logger.log(`➕ Creando nuevo usuario: ${email}`);
        user = await this.usersService.createPasswordlessUser(email);
        this.logger.debug(`✅ Usuario creado con ID: ${user.id}`);
      } else {
        this.logger.debug(`👤 Usuario existente: ${user.email} (ID: ${user.id})`);
        this.logger.debug(`Email verificado: ${user.emailVerified}`);
      }

      const loginToken = this.generateLoginToken();
      this.logger.debug(`🔑 Token generado: ${loginToken}`);
      this.logger.debug(`🔑 Token length: ${loginToken.length}`);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      this.logger.debug(`⏰ Token expira en: ${expiresAt.toISOString()}`);

      await this.usersService.setLoginToken(user.id, loginToken, expiresAt);

      const frontUrl =
        this.configService.get<string>('FRONT') || 'http://localhost:3000';
      const magicLink = `${frontUrl}/auth/verify?token=${loginToken}`;

      this.logger.log(`🔗 Magic Link generado para: ${email}`);
      this.logger.debug(`🔗 Link completo: ${magicLink}`);

      const sendMagicLink = await this.emailService.sendMagicLink(
        email,
        magicLink,
      );
      
      this.logger.log(`✉️ Email enviado a: ${email}`);
      this.logger.debug('='.repeat(80));

      return {
        message: 'Link enviado. Revisa tu email para iniciar sesión.',
      };
    } catch (error) {
      this.logger.error(`❌ Error en requestLogin: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al enviar el link');
    }
  }

  /**
   * Verify login - Verifica el token del link y retorna el JWT
   */
  async verifyLogin(
    token: string,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      // 🔍 DEBUG: Log del token recibido
      this.logger.debug('='.repeat(80));
      this.logger.debug('🔐 VERIFY LOGIN - Token recibido');
      this.logger.debug(`Token: ${token}`);
      this.logger.debug(`Token length: ${token?.length}`);
      this.logger.debug(`Timestamp: ${new Date().toISOString()}`);
      this.logger.debug('='.repeat(80));

      const user = await this.usersService.findByLoginToken(token);

      if (!user) {
        this.logger.warn(`❌ Token inválido o no encontrado: ${token}`);
        throw new UnauthorizedException('Link inválido o expirado');
      }

      this.logger.debug(`✅ Usuario encontrado: ${user.email} (ID: ${user.id})`);
      this.logger.debug(`Email verificado: ${user.emailVerified}`);
      this.logger.debug(`Token expira: ${user.loginTokenExpires}`);

      if (!user.loginTokenExpires || new Date() > user.loginTokenExpires) {
        this.logger.warn(`⏰ Token expirado para usuario: ${user.email}`);
        throw new UnauthorizedException(
          'El link ha expirado. Solicita uno nuevo.',
        );
      }

      // Marcar el email como verificado en el primer login exitoso
      if (!user.emailVerified) {
        this.logger.log(`📧 Verificando email para usuario: ${user.email}`);
        await this.usersService.markEmailAsVerified(user.id);
        user.emailVerified = true;
      }

      // Limpiar el token usado
      await this.usersService.clearLoginToken(user.id);
      this.logger.debug(`🗑️ Token limpiado para usuario: ${user.email}`);

      const accessToken = await this.generateJwtToken(user);
      this.logger.log(`🎉 Login exitoso para: ${user.email}`);
      this.logger.debug('='.repeat(80));

      delete (user as any).loginToken;
      delete (user as any).loginTokenExpires;

      return { user, accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al verificar el link');
    }
  }

  /**
   * Genera un token único y seguro para el Magic Link
   */
  private generateLoginToken(): string {
    const randomBytes = require('crypto').randomBytes(32);
    return randomBytes.toString('hex');
  }

  /**
   * Genera un JWT token para el usuario
   */
  private async generateJwtToken(user: User): Promise<string> {
    try {
      const payload = { 
        email: user.email, 
        sub: user.id,
        role: user.role, // Incluir el rol en el JWT
      };
      const secret = this.configService.get<string>('JWT_SECRET');

      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      this.logger.debug(`🎫 JWT Payload: ${JSON.stringify(payload)}`);

      return this.jwtService.sign(payload, {
        secret,
        expiresIn: '7d', // Token válido por 7 días
      });
    } catch (error) {
      throw new BadRequestException('Error generating token');
    }
  }
}
