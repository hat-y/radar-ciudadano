import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NeighborhoodsService } from './neighborhoods.service';
import { CreateNeighborhoodDto } from './dto/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from './dto/update-neighborhood.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Neighborhoods')
@Controller('neighborhoods')
export class NeighborhoodsController {
  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  /**
   * Crear un nuevo barrio (solo admins)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo barrio con polígono',
    description: 'Solo usuarios con rol JEFATURA pueden crear barrios',
  })
  async create(@Body() dto: CreateNeighborhoodDto) {
    return this.neighborhoodsService.create(dto);
  }

  /**
   * Listar todos los barrios
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todos los barrios',
    description: 'Obtiene la lista completa de barrios con sus polígonos',
  })
  async findAll() {
    return this.neighborhoodsService.findAll();
  }

  /**
   * Buscar barrio por punto (lat, lng)
   */
  @Get('find-by-point')
  @ApiOperation({
    summary: 'Buscar barrio que contiene un punto',
    description:
      'Encuentra el barrio que contiene las coordenadas dadas usando punto-en-polígono',
  })
  @ApiQuery({ name: 'lat', example: -26.1903 })
  @ApiQuery({ name: 'lng', example: -58.1835 })
  async findByPoint(@Query('lat') lat: string, @Query('lng') lng: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates');
    }

    return this.neighborhoodsService.findByPoint(latitude, longitude);
  }

  /**
   * Buscar barrios cercanos
   */
  @Get('nearby')
  @ApiOperation({
    summary: 'Buscar barrios cercanos a un punto',
    description: 'Encuentra barrios dentro de un radio específico',
  })
  @ApiQuery({ name: 'lat', example: -26.1903 })
  @ApiQuery({ name: 'lng', example: -58.1835 })
  @ApiQuery({ name: 'radius', example: 10, required: false })
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates');
    }

    return this.neighborhoodsService.findNearby(latitude, longitude, radiusKm);
  }

  /**
   * Obtener un barrio por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener barrio por ID',
    description: 'Busca un barrio específico por su ID',
  })
  async findOne(@Param('id') id: string) {
    return this.neighborhoodsService.findOne(id);
  }

  /**
   * Actualizar un barrio (solo admins)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un barrio existente',
    description: 'Solo usuarios con rol JEFATURA pueden actualizar barrios',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateNeighborhoodDto) {
    return this.neighborhoodsService.update(id, dto);
  }

  /**
   * Eliminar un barrio (solo admins)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.JEFATURA)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar un barrio',
    description: 'Solo usuarios con rol JEFATURA pueden eliminar barrios',
  })
  async remove(@Param('id') id: string) {
    await this.neighborhoodsService.remove(id);
    return { message: 'Neighborhood deleted successfully' };
  }
}
