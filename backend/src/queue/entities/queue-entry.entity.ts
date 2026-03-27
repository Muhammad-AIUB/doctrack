import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { QueuePriority, QueueEntryStatus } from '../../common/enums/index.js';
import { DailySession } from '../../sessions/entities/daily-session.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ConsultationLog } from '../../consultation-log/entities/consultation-log.entity.js';

@Entity('queue_entries')
@Index('idx_queue_active_session', ['sessionId', 'status', 'priorityScore'])
@Index('idx_queue_patient_lookup', ['patientId', 'sessionId'])
@Index('idx_queue_serial', ['sessionId', 'serialNumber'], { unique: true })
export class QueueEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @Column({ type: 'uuid', name: 'patient_id' })
  patientId!: string;

  @Column({ type: 'smallint', name: 'serial_number' })
  serialNumber!: number;

  @Column({ type: 'enum', enum: QueuePriority, default: QueuePriority.REGULAR })
  priority!: QueuePriority;

  @Column({
    type: 'enum',
    enum: QueueEntryStatus,
    default: QueueEntryStatus.WAITING,
  })
  status!: QueueEntryStatus;

  @Column({ type: 'int', name: 'priority_score' })
  priorityScore!: number;

  @Column({ type: 'timestamp', name: 'checked_in_at' })
  checkedInAt!: Date;

  @Column({ type: 'timestamp', name: 'consultation_start_time', nullable: true })
  consultationStartTime!: Date | null;

  @Column({ type: 'timestamp', name: 'consultation_end_time', nullable: true })
  consultationEndTime!: Date | null;

  @Column({ type: 'int', name: 'estimated_wait_sec', nullable: true })
  estimatedWaitSec!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes!: string | null;

  @Column({ type: 'smallint', name: 'skip_count', default: 0 })
  skipCount!: number;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => DailySession, (session) => session.queueEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: DailySession;

  @ManyToOne(() => User, (user) => user.queueEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: User;

  @OneToOne(() => ConsultationLog, (log) => log.queueEntry)
  consultationLog!: ConsultationLog | null;
}
