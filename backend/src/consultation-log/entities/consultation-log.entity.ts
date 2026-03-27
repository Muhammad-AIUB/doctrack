import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { QueueEntry } from '../../queue/entities/queue-entry.entity.js';
import { DailySession } from '../../sessions/entities/daily-session.entity.js';

@Entity('consultation_log')
@Index('idx_consultation_log_session', ['sessionId', 'recordedAt'])
export class ConsultationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'queue_entry_id' })
  queueEntryId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @Column({ type: 'int', name: 'duration_sec' })
  durationSec!: number;

  @Column({ type: 'timestamp', name: 'recorded_at', default: () => 'NOW()' })
  recordedAt!: Date;

  @OneToOne(() => QueueEntry, (entry) => entry.consultationLog, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'queue_entry_id' })
  queueEntry!: QueueEntry;

  @ManyToOne(() => DailySession, (session) => session.consultationLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: DailySession;
}
