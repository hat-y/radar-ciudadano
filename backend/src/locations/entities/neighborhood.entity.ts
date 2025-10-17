import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad para gestionar barrios con sus polígonos geográficos
 * Permite administrar barrios persistentes en base de datos
 */
@Entity('neighborhoods')
export class Neighborhood {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @Index()
  name!: string;

  // Polígono GeoJSON - Array de coordenadas [lng, lat]
  // Ejemplo: [[-58.1772, -26.1853], [-58.1753, -26.1856], ...]
  @Column('jsonb')
  polygon!: number[][];

  @Column({ nullable: true })
  provincia?: string;

  @Column({ nullable: true })
  departamento?: string;

  @Column({ nullable: true })
  localidad?: string;

  // Bounding box precalculado para optimizar búsquedas
  // { minLat, maxLat, minLng, maxLng }
  @Column('jsonb', { nullable: true })
  geoBounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };

  // Centro aproximado del polígono (centroide)
  @Column('jsonb', { nullable: true })
  center?: {
    lat: number;
    lng: number;
  };

  // Metadata adicional (opcional)
  @Column('jsonb', { nullable: true })
  metadata?: {
    area?: number; // Área en km²
    population?: number; // Población estimada
    description?: string; // Descripción del barrio
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Método helper para verificar si un punto está dentro del polígono
  containsPoint(lat: number, lng: number): boolean {
    let inside = false;
    const polygon = this.polygon;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0]; // lng
      const yi = polygon[i][1]; // lat
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect =
        yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }

    return inside;
  }

  // Calcula la distancia al centro del barrio
  distanceToCenter(lat: number, lng: number): number {
    if (!this.center) return Infinity;

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat - this.center.lat);
    const dLng = this.toRad(lng - this.center.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.center.lat)) *
        Math.cos(this.toRad(lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
