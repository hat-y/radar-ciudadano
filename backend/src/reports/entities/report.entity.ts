import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  lat!: number;

  @Column('decimal', { precision: 10, scale: 7 })
  lng!: number;

  @Column('text')
  description!: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  neighborhoodName?: string; // "Eva Perón", "San Martín"

  @Column({ nullable: true })
  localidad?: string; // "Formosa", "Villa del Carmen"

  @Column({ nullable: true })
  provincia?: string; // "Formosa"

  @Column({ nullable: true })
  departamento?: string; // "Formosa"

  @Column({ default: 'pending' })
  status!: string; // pending, in_progress, resolved, rejected

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
