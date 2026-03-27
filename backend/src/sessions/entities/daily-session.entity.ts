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
import { SessionStatus } from '../../common/enums/index.js';
import { Chamber } from '../../chambers/entities/chamber.entity.js';
import { QueueEntry } from '../../queue/entities/queue-entry.entity.js';
import { ConsultationLog } from '../../consultation-log/entities/consultation-log.entity.js';

@Entity('daily_sessions')
@Index('idx_session_active', ['chamberId', 'sessionDate', 'status'])
export class DailySession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'chamber_id' })
  chamberId!: string;

  @Column({ type: 'date', name: 'session_date' })
  sessionDate!: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status!: SessionStatus;

  @Column({ type: 'timestamp', name: 'actual_start_time', nullable: true })
  actualStartTime!: Date | null;

  @Column({ type: 'timestamp', name: 'actual_end_time', nullable: true })
  actualEndTime!: Date | null;

  @Column({
    type: 'smallint',
    name: 'avg_consultation_duration_sec',
    nullable: true,
  })
  avgConsultationDurationSec!: number | null;

  @Column({ type: 'int', name: 'total_patients_served', default: 0 })
  totalPatientsServed!: number;

  @Column({ type: 'int', name: 'eta_window_size', default: 10 })
  etaWindowSize!: number;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Chamber, (chamber) => chamber.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chamber_id' })
  chamber!: Chamber;

  @OneToMany(() => QueueEntry, (entry) => entry.session)
  queueEntries!: QueueEntry[];

  @OneToMany(() => ConsultationLog, (log) => log.session)
  consultationLogs!: ConsultationLog[];
}
