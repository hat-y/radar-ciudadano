import { Injectable, Logger } from '@nestjs/common';
import { NeighborhoodsService } from '../locations/neighborhoods.service';

interface NeighborhoodResult {
  nombre_barrio: string;
  provincia?: string;
  departamento?: string;
  localidad?: string;
}

@Injectable()
export class GeospatialService {
  private readonly logger = new Logger(GeospatialService.name);
  private readonly MAX_DISTANCE_KM = 50;

  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  async onModuleInit() {
    // Ya no necesitamos cargar del JSON, los barrios están en la DB
    const count = (await this.neighborhoodsService.findAll()).length;
    this.logger.log(`✓ GeospatialService initialized with ${count} neighborhoods from database`);
  }

  /**
   * Encuentra el barrio que contiene las coordenadas dadas
   * Primero intenta punto-en-polígono, luego busca por cercanía
   * @param lat Latitud del reporte
   * @param lng Longitud del reporte
   * @returns Información del barrio o null si está fuera del radio
   */
  async findNearestNeighborhood(
    lat: number,
    lng: number,
  ): Promise<NeighborhoodResult | null> {
    try {
      // Primero intentar encontrar por punto-en-polígono
      const neighborhood = await this.neighborhoodsService.findByPoint(lat, lng);

      if (neighborhood) {
        this.logger.log(
          `Found neighborhood by point-in-polygon: ${neighborhood.name}`,
        );
        return {
          nombre_barrio: neighborhood.name,
          provincia: neighborhood.provincia,
          departamento: neighborhood.departamento,
          localidad: neighborhood.localidad,
        };
      }

      // Si no está dentro de ningún polígono, buscar por cercanía
      const nearby = await this.neighborhoodsService.findNearby(
        lat,
        lng,
        this.MAX_DISTANCE_KM,
      );

      if (nearby.length > 0) {
        const nearest = nearby[0];
        const distance = nearest.distanceToCenter(lat, lng);
        
        this.logger.log(
          `Found nearest neighborhood: ${nearest.name} (${distance.toFixed(2)}km away)`,
        );
        
        return {
          nombre_barrio: nearest.name,
          provincia: nearest.provincia,
          departamento: nearest.departamento,
          localidad: nearest.localidad,
        };
      }

      this.logger.warn(
        `No neighborhood found within ${this.MAX_DISTANCE_KM}km for coordinates (${lat}, ${lng})`,
      );
      return null;
    } catch (error) {
      this.logger.error('Error finding neighborhood:', error);
      return null;
    }
  }

  /**
   * Calcula la distancia en kilómetros entre dos puntos usando la fórmula de Haversine
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const toRad = (value: number) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Obtiene la lista de todos los barrios disponibles
   */
  async getAllNeighborhoods(): Promise<string[]> {
    const neighborhoods = await this.neighborhoodsService.findAll();
    return neighborhoods.map((n) => n.name).sort();
  }

  /**
   * Verifica si un barrio existe
   */
  async neighborhoodExists(name: string): Promise<boolean> {
    const neighborhood = await this.neighborhoodsService.findByName(name);
    return neighborhood !== null;
  }
}
