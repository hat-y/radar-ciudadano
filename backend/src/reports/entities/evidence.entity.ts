import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';

export enum EvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

@Entity('evidences')
export class Evidence {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  reportId!: number;

  @ManyToOne(() => Report, (report) => report.evidences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report!: Report;

  @Column({
    type: 'enum',
    enum: EvidenceType,
    default: EvidenceType.IMAGE,
  })
  type!: EvidenceType;

  @Column()
  url!: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  fileSize?: number;

  @Column({ nullable: true })
  mimeType?: string;

  @Column('jsonb', { nullable: true })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    originalName?: string;
  };

  @CreateDateColumn()
  uploadedAt!: Date;
}
