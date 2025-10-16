import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('neighborhood_subscriptions')
export class NeighborhoodSubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  neighborhoodName!: string; // "Eva Perón", "San Martín", etc.

  @Column({ default: true })
  emailNotifications!: boolean;

  @Column({ default: true })
  pushNotifications!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
