// Modulos Externos
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

// Modulos Internos
import { UsersService } from './users.service';
import { multerOptions } from '../config/multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SubscribeToNeighborhoodDto } from './dto/subscribe-neighborhood.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Listar todos los usuarios - Solo JEFATURA
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  // Swagger
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description: 'Solo accesible por usuarios con rol JEFATURA',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios retornada exitosamente',
  })
  @ApiForbiddenResponse({
    description: 'No tienes permisos para acceder a este recurso',
  })
  // Fin del Swagger
  @Get()
  list() {
    return this.usersService.findAll();
  }

  /**
   * Obtener un usuario por ID - Autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Obtiene usuario por ID',
  })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Get(':id')
  one(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Crear usuario - Solo JEFATURA
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description: ' Solo accesible por usuarios con rol JEFATURA',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiForbiddenResponse({
    description: 'No tienes permisos para acceder a este recurso',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Actualizar usuario - Solo JEFATURA
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Solo accesible por usuarios con rol JEFATURA',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiForbiddenResponse({
    description: 'No tienes permisos para acceder a este recurso',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Eliminar usuario - Solo JEFATURA
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Solo accesible por usuarios con rol JEFATURA',
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiForbiddenResponse({
    description: 'No tienes permisos para acceder a este recurso',
  })
  @Delete(':id')
  del(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif)$/, // Fixed regex
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5, // 5MB, Matches the limits
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    // Here you would typically save the file path to the user's record in the database
    // For MVP, we'll just return the file info
    console.log(`User ${id} uploaded avatar:`, file);
    return {
      message: `Avatar for user ${id} uploaded successfully`,
      filename: file.filename,
      path: file.path,
    };
  }

  /**
   * Suscribirse a notificaciones de un barrio
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/subscriptions')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Suscribirse a notificaciones de un barrio',
  })
  subscribeToNeighborhood(
    @Param('id') userId: string,
    @Body() dto: SubscribeToNeighborhoodDto,
  ) {
    return this.usersService.subscribeToNeighborhood(userId, dto);
  }

  /**
   * Obtener suscripciones de un usuario
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/subscriptions')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener suscripciones de un usuario',
  })
  getUserSubscriptions(@Param('id') userId: string) {
    return this.usersService.getUserSubscriptions(userId);
  }

  /**
   * Cancelar suscripción a un barrio
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/subscriptions/:subscriptionId')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cancelar suscripción a un barrio',
  })
  unsubscribeFromNeighborhood(
    @Param('id') userId: string,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.usersService.unsubscribeFromNeighborhood(
      userId,
      subscriptionId,
    );
  }

  /**
   * Obtener lista de barrios disponibles
   */
  @Get('neighborhoods/available')
  @ApiOperation({
    summary: 'Obtener lista de todos los barrios disponibles',
  })
  getAvailableNeighborhoods() {
    return this.usersService.getAvailableNeighborhoods();
  }
}
