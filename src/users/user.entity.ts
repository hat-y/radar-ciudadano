// Modulos Externos
import {
  BeforeInsert,
  BeforeUpdate,
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

//Modulos Internos

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ default: false })
  deleted!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ select: false })
  password!: string;

  // Track if password has been hashed to avoid double hashing
  private isPasswordHashed = false;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password && !this.isPasswordHashed) {
      this.password = await bcrypt.hash(this.password, 10);
      this.isPasswordHashed = true;
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    // Only hash if password is being changed and hasn't been hashed yet
    if (
      this.password &&
      !this.isPasswordHashed &&
      !this.password.startsWith('$2b$')
    ) {
      this.password = await bcrypt.hash(this.password, 10);
      this.isPasswordHashed = true;
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}
