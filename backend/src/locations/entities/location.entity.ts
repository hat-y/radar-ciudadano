import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lat!: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lng!: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  neighborhoodName?: string;

  @Column({ nullable: true })
  localidad?: string;

  @Column({ nullable: true })
  provincia?: string;

  @Column({ nullable: true })
  departamento?: string;

  // GeoHash para búsquedas espaciales sin PostGIS
  @Column({ length: 12, nullable: true })
  @Index()
  geoHash?: string;

  // Datos raw del GeoJSON para referencia
  @Column('jsonb', { nullable: true })
  rawGeoData?: any;

  @CreateDateColumn()
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => Report, (report) => report.location)
  reports!: Report[];
}
