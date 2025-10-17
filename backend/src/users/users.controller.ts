// Modulos Externos// Modulos Externos

import {import {

  Controller,  Controller,

  Get,  Get,

  Param,  Param,

  Post,  Post,

  Body,  Body,

  Patch,  Patch,

  Delete,  Delete,

  UseGuards,  UseInterceptors,

} from '@nestjs/common';  UploadedFile,

import {  ParseFilePipeBuilder,

  ApiTags,  HttpStatus,

  ApiBearerAuth,  UseGuards,

  ApiOperation,} from '@nestjs/common';

  ApiResponse,import { FileInterceptor } from '@nestjs/platform-express';

  ApiForbiddenResponse,import {

} from '@nestjs/swagger';  ApiTags,

  ApiBearerAuth,

// Modulos Internos  ApiOperation,

import { UsersService } from './users.service';  ApiResponse,

import { JwtAuthGuard } from '../auth/jwt-auth.guard';  ApiForbiddenResponse,

import { RolesGuard } from '../auth/guards/roles.guard';} from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from './enums/user-role.enum';// Modulos Internos

import { CreateUserDto } from './dto/create-user.dto';import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';import { multerOptions } from '../config/multer.config';

import { SubscribeToNeighborhoodDto } from './dto/subscribe-neighborhood.dto';import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('users')import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')import { UserRole } from './enums/user-role.enum';

export class UsersController {import { CreateUserDto } from './dto/create-user.dto';

  constructor(private readonly usersService: UsersService) {}import { UpdateUserDto } from './dto/update-user.dto';

import { SubscribeToNeighborhoodDto } from './dto/subscribe-neighborhood.dto';

  /**

   * Listar todos los usuarios - Solo JEFATURA@ApiTags('users')

   */@Controller('users')

  @UseGuards(JwtAuthGuard, RolesGuard)export class UsersController {

  @Roles(UserRole.JEFATURA)  constructor(private readonly usersService: UsersService) {}

  // Swagger

  @ApiBearerAuth('access-token')  /**

  @ApiOperation({   * Listar todos los usuarios - Solo JEFATURA

    summary: 'Listar todos los usuarios',   */

    description: 'Solo accesible por usuarios con rol JEFATURA',  @UseGuards(JwtAuthGuard, RolesGuard)

  })  @Roles(UserRole.JEFATURA)

  @ApiResponse({  // Swagger

    status: 200,  @ApiBearerAuth('access-token')

    description: 'Lista de usuarios retornada exitosamente',  @ApiOperation({

  })    summary: 'Listar todos los usuarios',

  @ApiForbiddenResponse({    description: 'Solo accesible por usuarios con rol JEFATURA',

    description: 'No tienes permisos para acceder a este recurso',  })

  })  @ApiResponse({

  // Fin del Swagger    status: 200,

  @Get()    description: 'Lista de usuarios retornada exitosamente',

  list() {  })

    return this.usersService.findAll();  @ApiForbiddenResponse({

  }    description: 'No tienes permisos para acceder a este recurso',

  })

  /**  // Fin del Swagger

   * Obtener un usuario por ID - Autenticado  @Get()

   */  list() {

  @UseGuards(JwtAuthGuard)    return this.usersService.findAll();

  @Roles(UserRole.JEFATURA)  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  /**

    summary: 'Obtener usuario por ID',   * Obtener un usuario por ID - Autenticado

    description: 'Obtiene usuario por ID',   */

  })  @UseGuards(JwtAuthGuard)

  @ApiResponse({ status: 200, description: 'Usuario encontrado' })  @Roles(UserRole.JEFATURA)

  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })  @ApiBearerAuth('access-token')

  @Get(':id')  @ApiOperation({

  one(@Param('id') id: string) {    summary: 'Obtener usuario por ID',

    return this.usersService.findOne(id);    description: 'Obtiene usuario por ID',

  }  })

  @ApiResponse({ status: 200, description: 'Usuario encontrado' })

  /**  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })

   * Crear usuario - Solo JEFATURA  @Get(':id')

   */  one(@Param('id') id: string) {

  @UseGuards(JwtAuthGuard, RolesGuard)    return this.usersService.findOne(id);

  @Roles(UserRole.JEFATURA)  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  /**

    summary: 'Crear nuevo usuario',   * Crear usuario - Solo JEFATURA

    description: ' Solo accesible por usuarios con rol JEFATURA',   */

  })  @UseGuards(JwtAuthGuard, RolesGuard)

  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })  @Roles(UserRole.JEFATURA)

  @ApiForbiddenResponse({  @ApiBearerAuth('access-token')

    description: 'No tienes permisos para acceder a este recurso',  @ApiOperation({

  })    summary: 'Crear nuevo usuario',

  @Post()    description: ' Solo accesible por usuarios con rol JEFATURA',

  create(@Body() createUserDto: CreateUserDto) {  })

    return this.usersService.create(createUserDto);  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })

  }  @ApiForbiddenResponse({

    description: 'No tienes permisos para acceder a este recurso',

  /**  })

   * Actualizar usuario - Solo JEFATURA  @Post()

   */  create(@Body() createUserDto: CreateUserDto) {

  @UseGuards(JwtAuthGuard, RolesGuard)    return this.usersService.create(createUserDto);

  @Roles(UserRole.JEFATURA)  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  /**

    summary: 'Actualizar usuario',   * Actualizar usuario - Solo JEFATURA

    description: 'Solo accesible por usuarios con rol JEFATURA',   */

  })  @UseGuards(JwtAuthGuard, RolesGuard)

  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })  @Roles(UserRole.JEFATURA)

  @ApiForbiddenResponse({  @ApiBearerAuth('access-token')

    description: 'No tienes permisos para acceder a este recurso',  @ApiOperation({

  })    summary: 'Actualizar usuario',

  @Patch(':id')    description: 'Solo accesible por usuarios con rol JEFATURA',

  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {  })

    return this.usersService.update(id, updateUserDto);  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })

  }  @ApiForbiddenResponse({

    description: 'No tienes permisos para acceder a este recurso',

  /**  })

   * Eliminar usuario - Solo JEFATURA  @Patch(':id')

   */  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {

  @UseGuards(JwtAuthGuard, RolesGuard)    return this.usersService.update(id, updateUserDto);

  @Roles(UserRole.JEFATURA)  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  /**

    summary: 'Eliminar usuario',   * Eliminar usuario - Solo JEFATURA

    description: 'Solo accesible por usuarios con rol JEFATURA',   */

  })  @UseGuards(JwtAuthGuard, RolesGuard)

  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })  @Roles(UserRole.JEFATURA)

  @ApiForbiddenResponse({  @ApiBearerAuth('access-token')

    description: 'No tienes permisos para acceder a este recurso',  @ApiOperation({

  })    summary: 'Eliminar usuario',

  @Delete(':id')    description: 'Solo accesible por usuarios con rol JEFATURA',

  del(@Param('id') id: string) {  })

    return this.usersService.remove(id);  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })

  }  @ApiForbiddenResponse({

    description: 'No tienes permisos para acceder a este recurso',

  /**  })

   * Suscribirse a notificaciones de un barrio  @Delete(':id')

   */  del(@Param('id') id: string) {

  @UseGuards(JwtAuthGuard)    return this.usersService.remove(id);

  @Post(':id/subscriptions')  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  @UseGuards(JwtAuthGuard)

    summary: 'Suscribirse a notificaciones de un barrio',  @Post(':id/avatar')

  })  @UseInterceptors(FileInterceptor('avatar', multerOptions))

  subscribeToNeighborhood(  async uploadAvatar(

    @Param('id') userId: string,    @Param('id') id: string,

    @Body() dto: SubscribeToNeighborhoodDto,    @UploadedFile(

  ) {      new ParseFilePipeBuilder()

    return this.usersService.subscribeToNeighborhood(userId, dto);        .addFileTypeValidator({

  }          fileType: /(jpg|jpeg|png|gif)$/, // Fixed regex

        })

  /**        .addMaxSizeValidator({

   * Obtener suscripciones de un usuario          maxSize: 1024 * 1024 * 5, // 5MB, Matches the limits

   */        })

  @UseGuards(JwtAuthGuard)        .build({

  @Get(':id/subscriptions')          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,

  @ApiBearerAuth('access-token')        }),

  @ApiOperation({    )

    summary: 'Obtener suscripciones de un usuario',    file: Express.Multer.File,

  })  ) {

  getUserSubscriptions(@Param('id') userId: string) {    // Here you would typically save the file path to the user's record in the database

    return this.usersService.getUserSubscriptions(userId);    // For MVP, we'll just return the file info

  }    console.log(`User ${id} uploaded avatar:`, file);

    return {

  /**      message: `Avatar for user ${id} uploaded successfully`,

   * Cancelar suscripción a un barrio      filename: file.filename,

   */      path: file.path,

  @UseGuards(JwtAuthGuard)    };

  @Delete(':userId/subscriptions/:subscriptionId')  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  /**

    summary: 'Cancelar suscripción a un barrio',   * Suscribirse a notificaciones de un barrio

  })   */

  unsubscribeFromNeighborhood(  @UseGuards(JwtAuthGuard)

    @Param('userId') userId: string,  @Post(':id/subscriptions')

    @Param('subscriptionId') subscriptionId: string,  @ApiBearerAuth('access-token')

  ) {  @ApiOperation({

    return this.usersService.unsubscribeFromNeighborhood(userId, subscriptionId);    summary: 'Suscribirse a notificaciones de un barrio',

  }  })

  subscribeToNeighborhood(

  /**    @Param('id') userId: string,

   * Obtener barrios disponibles para suscripción    @Body() dto: SubscribeToNeighborhoodDto,

   */  ) {

  @UseGuards(JwtAuthGuard)    return this.usersService.subscribeToNeighborhood(userId, dto);

  @Get('neighborhoods/available')  }

  @ApiBearerAuth('access-token')

  @ApiOperation({  /**

    summary: 'Obtener barrios disponibles para suscripción',   * Obtener suscripciones de un usuario

  })   */

  getAvailableNeighborhoods() {  @UseGuards(JwtAuthGuard)

    return this.usersService.getAvailableNeighborhoods();  @Get(':id/subscriptions')

  }  @ApiBearerAuth('access-token')

}  @ApiOperation({

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
