import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface NeighborhoodFeature {
  type: 'Feature';
  properties: {
    nombre_barrio: string;
    provincia: string;
    departamento: string;
    localidad: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

interface NeighborhoodData {
  type: 'FeatureCollection';
  features: NeighborhoodFeature[];
}

@Injectable()
export class GeospatialService {
  private readonly logger = new Logger(GeospatialService.name);
  private neighborhoods: NeighborhoodFeature[] = [];
  private readonly MAX_DISTANCE_KM = 1; // Radio máximo para considerar que está en el barrio

  async onModuleInit() {
    await this.loadNeighborhoods();
  }

  private async loadNeighborhoods() {
    try {
      // Buscar el archivo en diferentes ubicaciones posibles
      const possiblePaths = [
        '/app/barrios_formosa_capital.json', // Docker (primero)
        path.join(process.cwd(), 'barrios_formosa_capital.json'), // En el mismo directorio
        path.join(process.cwd(), '..', 'barrios_formosa_capital.json'), // Desde backend/ -> raíz
        path.join(__dirname, '..', '..', '..', 'barrios_formosa_capital.json'), // Desde dist/
      ];

      let filePath: string | null = null;
      let data: string | null = null;

      // Intentar cada ruta
      for (const possiblePath of possiblePaths) {
        try {
          data = await fs.readFile(possiblePath, 'utf-8');
          filePath = possiblePath;
          this.logger.log(`Found GeoJSON file at: ${filePath}`);
          break;
        } catch {
          continue;
        }
      }

      if (!data || !filePath) {
        this.logger.error(
          'No se pudo encontrar barrios_formosa_capital.json. Rutas intentadas:',
        );
        possiblePaths.forEach((p) => this.logger.error(`  - ${p}`));
        this.neighborhoods = [];
        return;
      }

      const geojson: NeighborhoodData = JSON.parse(data);
      this.neighborhoods = geojson.features;
      this.logger.log(
        `✓ Loaded ${this.neighborhoods.length} neighborhoods from ${filePath}`,
      );
    } catch (error) {
      this.logger.error('Failed to load neighborhoods:', error);
      this.neighborhoods = [];
    }
  }

  /**
   * Encuentra el barrio más cercano a las coordenadas dadas
   * @param lat Latitud del reporte
   * @param lng Longitud del reporte
   * @returns Información del barrio o null si está fuera del radio
   */
  findNearestNeighborhood(
    lat: number,
    lng: number,
  ): NeighborhoodFeature['properties'] | null {
    if (this.neighborhoods.length === 0) {
      this.logger.warn('No neighborhoods loaded');
      return null;
    }

    let nearest: NeighborhoodFeature | null = null;
    let minDistance = Infinity;

    for (const neighborhood of this.neighborhoods) {
      const [nLng, nLat] = neighborhood.geometry.coordinates;
      const distance = this.calculateDistance(lat, lng, nLat, nLng);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = neighborhood;
      }
    }

    // Si el barrio más cercano está dentro del radio, retornarlo
    if (nearest && minDistance <= this.MAX_DISTANCE_KM) {
      this.logger.log(
        `Found neighborhood: ${nearest.properties.nombre_barrio} (${minDistance.toFixed(2)}km away)`,
      );
      return nearest.properties;
    }

    this.logger.warn(
      `No neighborhood found within ${this.MAX_DISTANCE_KM}km (nearest: ${minDistance.toFixed(2)}km)`,
    );
    return null;
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
  getAllNeighborhoods(): string[] {
    return this.neighborhoods.map((n) => n.properties.nombre_barrio).sort();
  }

  /**
   * Verifica si un barrio existe
   */
  neighborhoodExists(name: string): boolean {
    return this.neighborhoods.some(
      (n) => n.properties.nombre_barrio.toLowerCase() === name.toLowerCase(),
    );
  }
}
