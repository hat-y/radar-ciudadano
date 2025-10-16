import { 
  Controller,
  Post, 
  Body, 
  Get, 
  Query, 
  HttpCode, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestLoginDto } from './dto/request-login.dto';
import { VerifyLoginDto } from './dto/verify-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService
  ) {}

  /**
   * Solicita un magic link por email
   * POST /auth/request-login
   * Body: { "email": "user@example.com" }
   */
  @Post('request-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Solicitar inicio de sesión',
    description: 'Envía un enlace mágico al email del usuario para iniciar sesión sin contraseña. Si el usuario no existe, se crea automáticamente.',
  })
  @ApiBody({ type: RequestLoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Link enviado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Link enviado. Revisa tu email para iniciar sesión.'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email inválido o error al enviar el enlace',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Error al enviar el Magic Link' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async requestLogin(@Body() requestLoginDto: RequestLoginDto) {
    this.logger.log(`📬 POST /auth/request-login - Email: ${requestLoginDto.email}`);
    return this.authService.requestLogin(requestLoginDto);
  }

  /**
   * Verifica el token del magic link y retorna el JWT
   * GET /auth/verify-login?token=xxxxx
   * Query: { "token": "xxxxx" }
   */
  @Get('verify-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verificar Link y obtener JWT',
    description: 'Verifica el token del link recibido por email y retorna un JWT para autenticación. El token expira en 15 minutos y solo puede usarse una vez.',
  })
  @ApiQuery({ 
    name: 'token',
    type: String,
    description: 'Token único del link recibido por email',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso - Retorna JWT y datos del usuario',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-1234-5678' },
            email: { type: 'string', example: 'user@example.com' },
            username: { type: 'string', example: 'SilentPhoenix847' },
            role: { type: 'string', example: 'user', enum: ['user', 'jefatura'] },
            emailVerified: { type: 'boolean', example: true },
            isActive: { type: 'boolean', example: true }
          }
        },
        accessToken: { 
          type: 'string', 
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido o expirado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Link inválido o expirado' },
        error: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async verifyLogin(@Query() verifyLoginDto: VerifyLoginDto) {
    this.logger.log(`🔍 GET /auth/verify-login - Token recibido en controller`);
    this.logger.debug(`Token completo: ${verifyLoginDto.token}`);
    this.logger.debug(`Query params raw: ${JSON.stringify(verifyLoginDto)}`);
    
    return this.authService.verifyLogin(verifyLoginDto.token);
  }
}
