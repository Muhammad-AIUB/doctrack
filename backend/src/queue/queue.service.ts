import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntry } from './entities/queue-entry.entity.js';
import { PriorityQueueService, QueueNode } from './priority-queue.service.js';
import { EtaCalculatorService, EtaResult } from '../eta/eta-calculator.service.js';
import { SessionsService } from '../sessions/sessions.service.js';
import { RedisService } from '../infrastructure/redis/redis.service.js';
import { ConsultationLogService } from '../consultation-log/consultation-log.service.js';
import {
  QueuePriority,
  QueueEntryStatus,
  SessionStatus,
} from '../common/enums/index.js';
import { CheckInDto } from './dto/queue.dto.js';

const MAX_SKIP_COUNT = 3;
const LOCK_TTL_MS = 5000;

export interface QueueStateSnapshot {
  currentPatient: {
    entryId: string;
    patientId: string;
    serialNumber: number;
    priority: QueuePriority;
  } | null;
  queue: Array<{
    entryId: string;
    patientId: string;
    serialNumber: number;
    position: number;
    priority: QueuePriority;
    estimatedWaitSec: number;
  }>;
  stats: {
    totalWaiting: number;
    avgDurationSec: number;
    totalServed: number;
  };
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectRepository(QueueEntry)
    private readonly entryRepo: Repository<QueueEntry>,
    private readonly priorityQueue: PriorityQueueService,
    private readonly etaCalculator: EtaCalculatorService,
    private readonly sessionsService: SessionsService,
    private readonly redis: RedisService,
    private readonly consultationLog: ConsultationLogService,
  ) {}

  // ─── CHECK-IN ──────────────────────────────────────────────

  async checkIn(sessionId: string, dto: CheckInDto): Promise<QueueEntry> {
    const session = await this.sessionsService.findById(sessionId);

    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // Check max capacity
    if (session.chamber?.maxPatientsPerSession) {
      const count = await this.entryRepo.count({ where: { sessionId } });
      if (count >= session.chamber.maxPatientsPerSession) {
        throw new ConflictException('Session is full');
      }
    }

    // Atomic serial generation via Redis
    const serialNumber = await this.redis.increment(`serial:${sessionId}`);
    const priority = dto.priority ?? QueuePriority.REGULAR;
    const priorityScore = priority * 10000 + serialNumber;

    const entry = this.entryRepo.create({
      sessionId,
      patientId: dto.patientId,
      serialNumber,
      priority,
      status: QueueEntryStatus.WAITING,
      priorityScore,
      checkedInAt: new Date(),
      notes: dto.notes ?? null,
    });

    const saved = await this.entryRepo.save(entry);

    // Add to priority queue (heap + Redis ZSET)
    await this.priorityQueue.insert(sessionId, {
      entryId: saved.id,
      patientId: saved.patientId,
      priorityScore: saved.priorityScore,
      serialNumber: saved.serialNumber,
    });

    // Recalculate ETAs for everyone
    const defaultDuration = (session.chamber?.defaultAvgDurationMin ?? 10) * 60;
    const etas = await this.etaCalculator.recalculateAll(sessionId, defaultDuration);
    await this.persistEtas(etas);

    // Publish queue update
    await this.publishUpdate(sessionId);

    return saved;
  }

  // ─── ADVANCE QUEUE (NEXT PATIENT) ─────────────────────────

  async advanceQueue(sessionId: string): Promise<{
    completed: QueueEntry | null;
    next: QueueEntry | null;
  }> {
    const lockKey = `session:${sessionId}`;
    const lockId = await this.redis.acquireLock(lockKey, LOCK_TTL_MS);
    if (!lockId) {
      throw new ConflictException('Queue operation in progress, please retry');
    }

    try {
      return await this.doAdvanceQueue(sessionId);
    } finally {
      await this.redis.releaseLock(lockKey, lockId);
    }
  }

  private async doAdvanceQueue(sessionId: string): Promise<{
    completed: QueueEntry | null;
    next: QueueEntry | null;
  }> {
    const session = await this.sessionsService.findById(sessionId);
    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // 1. Complete current in-consultation patient
    const current = await this.entryRepo.findOne({
      where: { sessionId, status: QueueEntryStatus.IN_CONSULTATION },
    });

    let completedEntry: QueueEntry | null = null;

    if (current) {
      const now = new Date();
      const updateResult = await this.entryRepo.update(
        { id: current.id, version: current.version },
        {
          status: QueueEntryStatus.COMPLETED,
          consultationEndTime: now,
          version: current.version + 1,
        },
      );

      if (updateResult.affected === 0) {
        throw new ConflictException('Stale queue state — retry');
      }

      // Record consultation duration
      if (current.consultationStartTime) {
        const durationSec = Math.round(
          (now.getTime() - current.consultationStartTime.getTime()) / 1000,
        );
        await this.consultationLog.record(current.id, sessionId, durationSec);
        await this.redis.pushDuration(
          sessionId,
          durationSec,
          session.etaWindowSize,
        );
      }

      await this.sessionsService.incrementPatientsServed(sessionId);
      completedEntry = { ...current, status: QueueEntryStatus.COMPLETED, consultationEndTime: now };
    }

    // 2. Extract next patient from priority queue
    const nextNode = await this.priorityQueue.extractMin(sessionId);
    let nextEntry: QueueEntry | null = null;

    if (nextNode) {
      const now = new Date();
      await this.entryRepo.update(
        { id: nextNode.entryId },
        {
          status: QueueEntryStatus.IN_CONSULTATION,
          consultationStartTime: now,
        },
      );
      nextEntry = await this.entryRepo.findOne({
        where: { id: nextNode.entryId },
      });
      if (!nextEntry) {
        this.logger.warn(`Entry ${nextNode.entryId} not found after extraction — data inconsistency`);
      }
    }

    // 3. Recalculate ETAs
    const defaultDuration = (session.chamber?.defaultAvgDurationMin ?? 10) * 60;
    const etas = await this.etaCalculator.recalculateAll(sessionId, defaultDuration);
    await this.persistEtas(etas);

    // 4. Publish update
    await this.publishUpdate(sessionId);

    return { completed: completedEntry, next: nextEntry };
  }

  // ─── SKIP PATIENT ─────────────────────────────────────────

  async skipPatient(sessionId: string): Promise<QueueEntry | null> {
    const lockKey = `session:${sessionId}`;
    const lockId = await this.redis.acquireLock(lockKey, LOCK_TTL_MS);
    if (!lockId) {
      throw new ConflictException('Queue operation in progress, please retry');
    }

    try {
      return await this.doSkipPatient(sessionId);
    } finally {
      await this.redis.releaseLock(lockKey, lockId);
    }
  }

  private async doSkipPatient(sessionId: string): Promise<QueueEntry | null> {
    const session = await this.sessionsService.findById(sessionId);

    // Get the next patient from heap (the one being called)
    const nextNode = await this.priorityQueue.extractMin(sessionId);
    if (!nextNode) return null;

    const entry = await this.entryRepo.findOne({
      where: { id: nextNode.entryId },
    });
    if (!entry) return null;

    const newSkipCount = entry.skipCount + 1;

    if (newSkipCount >= MAX_SKIP_COUNT) {
      // Mark as NO_SHOW
      await this.entryRepo.update(
        { id: entry.id },
        { status: QueueEntryStatus.NO_SHOW, skipCount: newSkipCount },
      );
    } else {
      // Mark current as SKIPPED
      await this.entryRepo.update(
        { id: entry.id },
        { status: QueueEntryStatus.SKIPPED, skipCount: newSkipCount },
      );

      // Re-queue with FOLLOW_UP priority and new serial
      const newSerial = await this.redis.increment(`serial:${sessionId}`);
      const newScore = QueuePriority.FOLLOW_UP * 10000 + newSerial;

      const requeued = this.entryRepo.create({
        sessionId,
        patientId: entry.patientId,
        serialNumber: newSerial,
        priority: QueuePriority.FOLLOW_UP,
        status: QueueEntryStatus.WAITING,
        priorityScore: newScore,
        checkedInAt: new Date(),
        skipCount: newSkipCount,
        notes: entry.notes,
      });
      const saved = await this.entryRepo.save(requeued);

      await this.priorityQueue.insert(sessionId, {
        entryId: saved.id,
        patientId: saved.patientId,
        priorityScore: saved.priorityScore,
        serialNumber: saved.serialNumber,
      });
    }

    // Recalculate ETAs
    const defaultDuration = (session.chamber?.defaultAvgDurationMin ?? 10) * 60;
    const etas = await this.etaCalculator.recalculateAll(sessionId, defaultDuration);
    await this.persistEtas(etas);

    await this.publishUpdate(sessionId);

    return entry;
  }

  // ─── CANCEL ───────────────────────────────────────────────

  async cancelEntry(sessionId: string, entryId: string): Promise<void> {
    const entry = await this.entryRepo.findOne({ where: { id: entryId, sessionId } });
    if (!entry) throw new NotFoundException('Queue entry not found');
    if (entry.status !== QueueEntryStatus.WAITING) {
      throw new BadRequestException('Can only cancel entries that are WAITING');
    }

    await this.entryRepo.update({ id: entryId }, { status: QueueEntryStatus.CANCELLED });
    await this.priorityQueue.remove(sessionId, entryId);

    const session = await this.sessionsService.findById(sessionId);
    const defaultDuration = (session.chamber?.defaultAvgDurationMin ?? 10) * 60;
    const etas = await this.etaCalculator.recalculateAll(sessionId, defaultDuration);
    await this.persistEtas(etas);

    await this.publishUpdate(sessionId);
  }

  // ─── STATE SNAPSHOT ───────────────────────────────────────

  async getQueueState(sessionId: string): Promise<QueueStateSnapshot> {
    const session = await this.sessionsService.findById(sessionId);

    const currentPatientEntry = await this.entryRepo.findOne({
      where: { sessionId, status: QueueEntryStatus.IN_CONSULTATION },
    });

    const sorted = this.priorityQueue.getSortedQueue(sessionId);
    const durations = await this.redis.getDurations(sessionId);
    const avgDuration =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : (session.chamber?.defaultAvgDurationMin ?? 10) * 60;

    const defaultDuration = (session.chamber?.defaultAvgDurationMin ?? 10) * 60;

    const queue = sorted.map((node, i) => ({
      entryId: node.entryId,
      patientId: node.patientId,
      serialNumber: node.serialNumber,
      position: i + 1,
      priority: this.scoreToEnum(node.priorityScore),
      estimatedWaitSec: this.etaCalculator.calculateSingle(
        i + 1,
        durations,
        defaultDuration,
      ),
    }));

    return {
      currentPatient: currentPatientEntry
        ? {
            entryId: currentPatientEntry.id,
            patientId: currentPatientEntry.patientId,
            serialNumber: currentPatientEntry.serialNumber,
            priority: currentPatientEntry.priority,
          }
        : null,
      queue,
      stats: {
        totalWaiting: sorted.length,
        avgDurationSec: avgDuration,
        totalServed: session.totalPatientsServed,
      },
    };
  }

  // ─── REBUILD (server restart) ─────────────────────────────

  async rebuildSessionQueue(sessionId: string): Promise<void> {
    const waitingEntries = await this.entryRepo.find({
      where: { sessionId, status: QueueEntryStatus.WAITING },
      order: { priorityScore: 'ASC' },
    });

    for (const entry of waitingEntries) {
      await this.priorityQueue.insert(sessionId, {
        entryId: entry.id,
        patientId: entry.patientId,
        priorityScore: entry.priorityScore,
        serialNumber: entry.serialNumber,
      });
    }

    this.logger.log(
      `Rebuilt queue for session ${sessionId}: ${waitingEntries.length} entries`,
    );
  }

  // ─── HELPERS ──────────────────────────────────────────────

  private async persistEtas(etas: EtaResult[]): Promise<void> {
    if (etas.length === 0) return;
    const promises = etas.map((e) =>
      this.entryRepo.update({ id: e.entryId }, { estimatedWaitSec: e.estimatedWaitSec }),
    );
    await Promise.all(promises);
  }

  private async publishUpdate(sessionId: string): Promise<void> {
    const state = await this.getQueueState(sessionId);
    const sequence = await this.redis.increment(`seq:session:${sessionId}`);
    const event = {
      type: 'QUEUE_UPDATED',
      sessionId,
      timestamp: new Date().toISOString(),
      sequence,
      data: state,
    };
    await this.redis.publish(
      `session:${sessionId}:updates`,
      JSON.stringify(event),
    );
  }

  private scoreToEnum(priorityScore: number): QueuePriority {
    const tier = Math.floor(priorityScore / 10000);
    switch (tier) {
      case QueuePriority.EMERGENCY: return QueuePriority.EMERGENCY;
      case QueuePriority.VIP: return QueuePriority.VIP;
      case QueuePriority.FOLLOW_UP: return QueuePriority.FOLLOW_UP;
      case QueuePriority.REGULAR:
      default:
        return QueuePriority.REGULAR;
    }
  }
}
