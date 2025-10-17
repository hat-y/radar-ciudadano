import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Modulos Internos
import { Neighborhood } from './entities/neighborhood.entity';
import { CreateNeighborhoodDto } from './dto/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from './dto/update-neighborhood.dto';

@Injectable()
export class NeighborhoodsService {
  private readonly logger = new Logger(NeighborhoodsService.name);

  constructor(
    @InjectRepository(Neighborhood)
    private readonly neighborhoodRepo: Repository<Neighborhood>,
  ) {}

  /**
   * Crea un nuevo barrio con su polígono
   */
  async create(dto: CreateNeighborhoodDto): Promise<Neighborhood> {
    // Verificar que el nombre no exista
    const existing = await this.neighborhoodRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Neighborhood with name "${dto.name}" already exists`,
      );
    }

    // Validar polígono
    this.validatePolygon(dto.polygon);

    // Calcular bounding box y centro
    const geoBounds = this.calculateBounds(dto.polygon);
    const center = this.calculateCenter(dto.polygon);

    const neighborhood = this.neighborhoodRepo.create({
      ...dto,
      geoBounds,
      center,
    });

    const saved = await this.neighborhoodRepo.save(neighborhood);
    this.logger.log(
      `Neighborhood "${saved.name}" created with ID: ${saved.id}`,
    );

    return saved;
  }

  /**
   * Lista todos los barrios
   */
  async findAll(): Promise<Neighborhood[]> {
    return this.neighborhoodRepo.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Busca un barrio por ID
   */
  async findOne(id: string): Promise<Neighborhood> {
    const neighborhood = await this.neighborhoodRepo.findOne({
      where: { id },
    });

    if (!neighborhood) {
      throw new NotFoundException(`Neighborhood with ID "${id}" not found`);
    }

    return neighborhood;
  }

  /**
   * Busca un barrio por nombre
   */
  async findByName(name: string): Promise<Neighborhood | null> {
    return this.neighborhoodRepo.findOne({
      where: { name },
    });
  }

  /**
   * Actualiza un barrio existente
   */
  async update(id: string, dto: UpdateNeighborhoodDto): Promise<Neighborhood> {
    const neighborhood = await this.findOne(id);

    // Si se cambia el nombre, verificar que no exista
    if (dto.name && dto.name !== neighborhood.name) {
      const existing = await this.neighborhoodRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Neighborhood with name "${dto.name}" already exists`,
        );
      }
    }

    // Si se actualiza el polígono, recalcular bounds y centro
    let geoBounds = neighborhood.geoBounds;
    let center = neighborhood.center;

    if (dto.polygon) {
      this.validatePolygon(dto.polygon);
      geoBounds = this.calculateBounds(dto.polygon);
      center = this.calculateCenter(dto.polygon);
    }

    Object.assign(neighborhood, dto, { geoBounds, center });
    const saved = await this.neighborhoodRepo.save(neighborhood);

    this.logger.log(`Neighborhood "${saved.name}" updated`);
    return saved;
  }

  /**
   * Elimina un barrio
   */
  async remove(id: string): Promise<void> {
    const neighborhood = await this.findOne(id);
    await this.neighborhoodRepo.remove(neighborhood);
    this.logger.log(`Neighborhood "${neighborhood.name}" deleted`);
  }

  /**
   * Encuentra el barrio que contiene el punto dado
   * Usa algoritmo punto-en-polígono (Ray Casting)
   */
  async findByPoint(lat: number, lng: number): Promise<Neighborhood | null> {
    // Primero filtrar por bounding box para optimizar
    const candidates = await this.neighborhoodRepo
      .createQueryBuilder('n')
      .where(
        "(n.geoBounds->>'minLat')::float <= :lat AND (n.geoBounds->>'maxLat')::float >= :lat",
        { lat }
      )
      .andWhere(
        "(n.geoBounds->>'minLng')::float <= :lng AND (n.geoBounds->>'maxLng')::float >= :lng",
        { lng }
      )
      .getMany();

    // Verificar punto en polígono para cada candidato
    for (const neighborhood of candidates) {
      if (neighborhood.containsPoint(lat, lng)) {
        return neighborhood;
      }
    }

    return null;
  }

  /**
   * Encuentra barrios cercanos a un punto (dentro de un radio en km)
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 10,
  ): Promise<Neighborhood[]> {
    const allNeighborhoods = await this.findAll();

    return allNeighborhoods
      .map((n) => ({
        neighborhood: n,
        distance: n.distanceToCenter(lat, lng),
      }))
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.neighborhood);
  }

  /**
   * Valida que el polígono sea válido
   */
  private validatePolygon(polygon: number[][]): void {
    if (polygon.length < 3) {
      throw new BadRequestException('Polygon must have at least 3 coordinates');
    }

    // Verificar que cada coordenada tenga 2 elementos [lng, lat]
    for (const coord of polygon) {
      if (!Array.isArray(coord) || coord.length !== 2) {
        throw new BadRequestException('Each coordinate must be [lng, lat]');
      }

      const [lng, lat] = coord;

      if (typeof lng !== 'number' || typeof lat !== 'number') {
        throw new BadRequestException('Coordinates must be numbers');
      }

      // Validar rangos
      if (lat < -90 || lat > 90) {
        throw new BadRequestException(
          `Invalid latitude: ${lat}. Must be between -90 and 90`,
        );
      }

      if (lng < -180 || lng > 180) {
        throw new BadRequestException(
          `Invalid longitude: ${lng}. Must be between -180 and 180`,
        );
      }
    }

    // Verificar que el polígono esté cerrado (primer punto === último punto)
    const first = polygon[0];
    const last = polygon[polygon.length - 1];

    if (first[0] !== last[0] || first[1] !== last[1]) {
      throw new BadRequestException(
        'Polygon must be closed (first point must equal last point)',
      );
    }
  }

  /**
   * Calcula el bounding box del polígono
   */
  private calculateBounds(polygon: number[][]): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const [lng, lat] of polygon) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    return { minLat, maxLat, minLng, maxLng };
  }

  /**
   * Calcula el centro (centroide) del polígono
   */
  private calculateCenter(polygon: number[][]): { lat: number; lng: number } {
    let sumLat = 0;
    let sumLng = 0;
    const count = polygon.length - 1; // Excluir el último punto (duplicado)

    for (let i = 0; i < count; i++) {
      sumLng += polygon[i][0];
      sumLat += polygon[i][1];
    }

    return {
      lng: sumLng / count,
      lat: sumLat / count,
    };
  }
}
