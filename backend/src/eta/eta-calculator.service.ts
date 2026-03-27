import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IEtaStrategy } from './strategies/eta-strategy.interface.js';
import { RedisService } from '../infrastructure/redis/redis.service.js';
import { PriorityQueueService } from '../queue/priority-queue.service.js';

export const ETA_STRATEGY = Symbol('ETA_STRATEGY');

export interface EtaResult {
  entryId: string;
  estimatedWaitSec: number;
}

@Injectable()
export class EtaCalculatorService {
  private readonly logger = new Logger(EtaCalculatorService.name);

  constructor(
    @Inject(ETA_STRATEGY) private strategy: IEtaStrategy,
    private readonly redis: RedisService,
    private readonly priorityQueue: PriorityQueueService,
  ) {
    this.logger.log(`ETA strategy initialized: ${this.strategy.name}`);
  }

  setStrategy(strategy: IEtaStrategy): void {
    this.strategy = strategy;
    this.logger.log(`ETA strategy changed to: ${strategy.name}`);
  }

  /**
   * Calculate ETA for a single position in the queue.
   */
  calculateSingle(
    position: number,
    durations: number[],
    defaultDurationSec: number,
  ): number {
    return this.strategy.calculate(position, durations, defaultDurationSec);
  }

  /**
   * Recalculate ETAs for ALL waiting patients in a session.
   *
   * This is the hot path — called every time a patient is completed or skipped.
   * Returns a map of entryId → estimated wait in seconds.
   *
   * The first patient in queue (position 1) gets an ETA that accounts for
   * the current in-consultation patient's remaining time, which the caller
   * should adjust for.
   */
  async recalculateAll(
    sessionId: string,
    defaultDurationSec: number,
  ): Promise<EtaResult[]> {
    const durations = await this.redis.getDurations(sessionId);
    const sorted = this.priorityQueue.getSortedQueue(sessionId);

    const results: EtaResult[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const position = i + 1; // 1-based
      const eta = this.strategy.calculate(position, durations, defaultDurationSec);
      results.push({
        entryId: sorted[i]!.entryId,
        estimatedWaitSec: eta,
      });
    }

    return results;
  }
}
