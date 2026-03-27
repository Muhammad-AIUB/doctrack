import { Injectable, Logger } from '@nestjs/common';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

@Injectable()
export class RedisCircuitBreaker {
  private readonly logger = new Logger(RedisCircuitBreaker.name);
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;

  private readonly failureThreshold = 5;
  private readonly resetTimeoutMs = 30_000;

  async execute<T>(
    redisOp: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.logger.warn('Circuit breaker: HALF_OPEN — testing Redis');
      } else {
        return fallback();
      }
    }

    try {
      const result = await redisOp();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      this.logger.warn(`Redis operation failed, using fallback. Failures: ${this.failureCount}`);
      return fallback();
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state !== 'CLOSED') {
      this.logger.log('Circuit breaker: CLOSED — Redis recovered');
      this.state = 'CLOSED';
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold && this.state === 'CLOSED') {
      this.state = 'OPEN';
      this.logger.error('Circuit breaker: OPEN — Redis unavailable, using fallback');
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
