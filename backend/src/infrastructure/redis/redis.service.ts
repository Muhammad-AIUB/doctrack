import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module.js';
import { randomUUID } from 'crypto';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  getClient(): Redis {
    return this.redis;
  }

  // --- Distributed Lock ---

  async acquireLock(key: string, ttlMs: number = 5000): Promise<string | null> {
    const lockId = randomUUID();
    const result = await this.redis.set(
      `lock:${key}`,
      lockId,
      'PX',
      ttlMs,
      'NX',
    );
    return result === 'OK' ? lockId : null;
  }

  async releaseLock(key: string, lockId: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redis.eval(script, 1, `lock:${key}`, lockId);
    return result === 1;
  }

  // --- Atomic Counter ---

  async increment(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  // --- Duration List (for ETA) ---

  async pushDuration(sessionId: string, durationSec: number, windowSize: number): Promise<void> {
    const key = `durations:${sessionId}`;
    await this.redis.rpush(key, durationSec.toString());
    await this.redis.ltrim(key, -windowSize, -1);
  }

  async getDurations(sessionId: string): Promise<number[]> {
    const key = `durations:${sessionId}`;
    const values = await this.redis.lrange(key, 0, -1);
    return values.map(Number);
  }

  // --- Pub/Sub ---

  async publish(channel: string, message: string): Promise<number> {
    return this.redis.publish(channel, message);
  }

  // --- Sorted Set (Priority Queue backing) ---

  async zAdd(key: string, score: number, member: string): Promise<number> {
    return this.redis.zadd(key, score, member);
  }

  async zRem(key: string, member: string): Promise<number> {
    return this.redis.zrem(key, member);
  }

  async zRangeWithScores(key: string): Promise<Array<{ member: string; score: number }>> {
    const result = await this.redis.zrange(key, 0, -1, 'WITHSCORES');
    const entries: Array<{ member: string; score: number }> = [];
    for (let i = 0; i < result.length; i += 2) {
      entries.push({ member: result[i]!, score: Number(result[i + 1]) });
    }
    return entries;
  }

  async zRank(key: string, member: string): Promise<number | null> {
    return this.redis.zrank(key, member);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
