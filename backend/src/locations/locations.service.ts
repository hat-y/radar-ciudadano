import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ngeohash from 'ngeohash';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  /**
   * Crear una nueva ubicación
   */
  async create(data: {
    lat: number;
    lng: number;
    address?: string;
    neighborhoodName?: string;
    localidad?: string;
    provincia?: string;
    departamento?: string;
  }): Promise<Location> {
    const geoHash = ngeohash.encode(data.lat, data.lng, 12);

    const location = this.locationRepo.create({
      ...data,
      geoHash,
    });

    return this.locationRepo.save(location);
  }

  /**
   * Buscar o crear ubicación (evita duplicados)
   */
  async findOrCreate(
    lat: number,
    lng: number,
    metadata?: {
      address?: string;
      neighborhoodName?: string;
      localidad?: string;
      provincia?: string;
      departamento?: string;
    },
  ): Promise<Location> {
    const geoHash = ngeohash.encode(lat, lng, 12);

    // Buscar por geoHash (ubicaciones muy cercanas)
    let location = await this.locationRepo.findOne({
      where: { geoHash },
    });

    if (location) {
      return location;
    }

    // Si no existe, crear nueva
    return this.create({
      lat,
      lng,
      ...metadata,
    });
  }

  /**
   * Obtener ubicación por ID
   */
  async findById(id: number): Promise<Location> {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['reports'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  /**
   * Buscar ubicaciones cercanas (Haversine)
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5,
  ): Promise<Location[]> {
    return this.locationRepo
      .createQueryBuilder('loc')
      .where(
        `(
          2 * 6371 * asin(sqrt(
            power(sin(radians((loc.lat - :lat)/2)), 2) +
            cos(radians(:lat)) * cos(radians(loc.lat)) *
            power(sin(radians((loc.lng - :lng)/2)), 2)
          ))
        ) <= :radius`,
        { lat, lng, radius: radiusKm },
      )
      .orderBy(
        `2 * 6371 * asin(sqrt(
          power(sin(radians((loc.lat - :lat)/2)), 2) +
          cos(radians(:lat)) * cos(radians(loc.lat)) *
          power(sin(radians((loc.lng - :lng)/2)), 2)
        ))`,
        'ASC',
      )
      .setParameters({ lat, lng })
      .getMany();
  }

  /**
   * Buscar por geoHash
   */
  async findByGeoHash(geoHash: string): Promise<Location[]> {
    return this.locationRepo.find({
      where: { geoHash },
    });
  }

  /**
   * Actualizar metadata de ubicación
   */
  async update(
    id: number,
    data: {
      address?: string;
      neighborhoodName?: string;
      localidad?: string;
      provincia?: string;
      departamento?: string;
    },
  ): Promise<Location> {
    const location = await this.findById(id);
    Object.assign(location, data);
    return this.locationRepo.save(location);
  }

  /**
   * Obtener todas las ubicaciones
   */
  async findAll(): Promise<Location[]> {
    return this.locationRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
