// Modulos Externos
import { IsEmail } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

//Modulos Internos
import { UserRole } from './enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'El email debe ser valido' })
  email!: string;

  @Column()
  username!: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role!: UserRole;

  @Column({ default: false })
  deleted!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  loginToken!: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  loginTokenExpires!: Date | null;
}
