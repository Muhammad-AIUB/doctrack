import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationLog } from './entities/consultation-log.entity.js';

@Injectable()
export class ConsultationLogService {
  constructor(
    @InjectRepository(ConsultationLog)
    private readonly logRepo: Repository<ConsultationLog>,
  ) {}

  async record(
    queueEntryId: string,
    sessionId: string,
    durationSec: number,
  ): Promise<ConsultationLog> {
    const log = this.logRepo.create({
      queueEntryId,
      sessionId,
      durationSec,
    });
    return this.logRepo.save(log);
  }

  /**
   * Fallback: fetch last N durations from DB when Redis is unavailable.
   */
  async getLastNDurations(
    sessionId: string,
    n: number,
  ): Promise<number[]> {
    const logs = await this.logRepo.find({
      where: { sessionId },
      order: { recordedAt: 'DESC' },
      take: n,
    });
    return logs.map((l) => l.durationSec).reverse();
  }
}
