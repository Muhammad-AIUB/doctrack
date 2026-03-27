import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { DailySession } from '../../sessions/entities/daily-session.entity.js';

@Entity('chambers')
export class Chamber {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_chambers_doctor')
  @Column({ type: 'uuid', name: 'doctor_id' })
  doctorId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({
    type: 'smallint',
    name: 'default_avg_duration_min',
    default: 10,
  })
  defaultAvgDurationMin!: number;

  @Column({
    type: 'smallint',
    name: 'max_patients_per_session',
    nullable: true,
  })
  maxPatientsPerSession!: number | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.chambers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: User;

  @OneToMany(() => DailySession, (session) => session.chamber)
  sessions!: DailySession[];
}
