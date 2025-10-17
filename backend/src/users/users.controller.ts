// Modulos Externos
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

// Modulos Internos
import { UsersService } from './users.service';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios retornada exitosamente' })
  @Get()
  list() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @Get(':id')
  one(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @Delete(':id')
  del(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/subscriptions')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Suscribirse a notificaciones de un barrio' })
  @ApiResponse({ status: 201, description: 'Suscripción creada exitosamente' })
  subscribeToNeighborhood(@Param('id') userId: string, @Body() dto: SubscribeToNeighborhoodDto) {
    return this.usersService.subscribeToNeighborhood(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/subscriptions')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener suscripciones de un usuario' })
  @ApiResponse({ status: 200, description: 'Lista de suscripciones' })
  getUserSubscriptions(@Param('id') userId: string) {
    return this.usersService.getUserSubscriptions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId/subscriptions/:subscriptionId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cancelar suscripción a un barrio' })
  @ApiResponse({ status: 200, description: 'Suscripción cancelada exitosamente' })
  unsubscribeFromNeighborhood(@Param('userId') userId: string, @Param('subscriptionId') subscriptionId: string) {
    return this.usersService.unsubscribeFromNeighborhood(userId, subscriptionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('neighborhoods/available')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener barrios disponibles para suscripción' })
  @ApiResponse({ status: 200, description: 'Lista de barrios disponibles' })
  getAvailableNeighborhoods() {
    return this.usersService.getAvailableNeighborhoods();
  }
}
