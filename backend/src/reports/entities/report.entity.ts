import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Location } from '../../locations/entities/location.entity';
import { Evidence } from './evidence.entity';

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('reports')
@Index(['lat', 'lng']) // Búsquedas geoespaciales
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  title?: string;

  @Column('text')
  description!: string;

  // Lat/Lng desnormalizado para queries rápidas (mantener compatibilidad)
  @Column('decimal', { precision: 10, scale: 7 })
  @Index()
  lat!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  @Index()
  lng!: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @Index()
  status!: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportSeverity,
    default: ReportSeverity.MEDIUM,
  })
  severity!: ReportSeverity;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  neighborhoodName?: string;

  @Column({ nullable: true })
  localidad?: string;

  @Column({ nullable: true })
  provincia?: string;

  @Column({ nullable: true })
  departamento?: string;

  @Column({ default: 0 })
  viewCount!: number;

  @Column({ default: 0 })
  upvotes!: number;

  // FK a Location (normalizado)
  @Column({ nullable: true })
  @Index()
  locationId?: number;

  @ManyToOne(() => Location, (location) => location.reports, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'locationId' })
  location?: Location;

  // FK a User (opcional)
  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Relación con evidencias
  @OneToMany(() => Evidence, (evidence) => evidence.report, {
    cascade: true,
    eager: false,
  })
  evidences!: Evidence[];

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // Soft delete
}
