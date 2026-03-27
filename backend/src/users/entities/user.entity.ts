import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole } from '../../common/enums/index.js';
import { Chamber } from '../../chambers/entities/chamber.entity.js';
import { QueueEntry } from '../../queue/entities/queue-entry.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Index('idx_users_phone', { unique: true })
  @Column({ type: 'varchar', length: 15, unique: true })
  phone!: string;

  @Index('idx_users_email', { unique: true })
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email!: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Chamber, (chamber) => chamber.doctor)
  chambers!: Chamber[];

  @OneToMany(() => QueueEntry, (entry) => entry.patient)
  queueEntries!: QueueEntry[];
}
