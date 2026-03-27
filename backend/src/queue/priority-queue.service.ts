import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../infrastructure/redis/redis.service.js';
import { MinHeap } from './min-heap.js';

export interface QueueNode {
  entryId: string;
  patientId: string;
  priorityScore: number;
  serialNumber: number;
}

const compareNodes = (a: QueueNode, b: QueueNode): number =>
  a.priorityScore - b.priorityScore;

@Injectable()
export class PriorityQueueService {
  private readonly logger = new Logger(PriorityQueueService.name);
  private readonly heaps = new Map<string, MinHeap<QueueNode>>();

  constructor(private readonly redis: RedisService) {}

  /**
   * Insert a patient into the session queue.
   * Writes to both the in-memory heap and Redis ZSET.
   */
  async insert(sessionId: string, node: QueueNode): Promise<void> {
    const heap = this.getOrCreateHeap(sessionId);
    heap.insert(node);

    await this.redis.zAdd(
      this.zsetKey(sessionId),
      node.priorityScore,
      this.serializeMember(node),
    );
  }

  /**
   * Extract the highest-priority patient (lowest score).
   * Removes from both heap and Redis.
   */
  async extractMin(sessionId: string): Promise<QueueNode | null> {
    const heap = this.getOrCreateHeap(sessionId);
    const node = heap.extractMin();
    if (!node) return null;

    await this.redis.zRem(this.zsetKey(sessionId), this.serializeMember(node));
    return node;
  }

  peek(sessionId: string): QueueNode | null {
    return this.getOrCreateHeap(sessionId).peek();
  }

  /**
   * Remove a specific entry (for cancellations).
   */
  async remove(sessionId: string, entryId: string): Promise<boolean> {
    const heap = this.getOrCreateHeap(sessionId);
    const removed = heap.remove((n) => n.entryId === entryId);

    if (removed) {
      // We need to scan Redis to find the member with this entryId
      const members = await this.redis.zRangeWithScores(this.zsetKey(sessionId));
      for (const m of members) {
        if (m.member.startsWith(entryId + ':')) {
          await this.redis.zRem(this.zsetKey(sessionId), m.member);
          break;
        }
      }
    }
    return removed;
  }

  /**
   * Get position (0-based) of an entry in the priority order.
   */
  async getPosition(sessionId: string, entryId: string): Promise<number | null> {
    const members = await this.redis.zRangeWithScores(this.zsetKey(sessionId));
    const index = members.findIndex((m) => m.member.startsWith(entryId + ':'));
    return index === -1 ? null : index;
  }

  /**
   * Get all waiting entries in priority order.
   */
  getSortedQueue(sessionId: string): QueueNode[] {
    return this.getOrCreateHeap(sessionId).toSortedArray();
  }

  get queueSize(): (sessionId: string) => number {
    return (sessionId: string) => this.getOrCreateHeap(sessionId).size;
  }

  getSize(sessionId: string): number {
    return this.getOrCreateHeap(sessionId).size;
  }

  /**
   * Rebuild the in-memory heap from Redis (e.g., after server restart).
   */
  async rebuildFromRedis(sessionId: string): Promise<void> {
    const members = await this.redis.zRangeWithScores(this.zsetKey(sessionId));
    const nodes = members.map((m) => this.deserializeMember(m.member, m.score));

    const heap = MinHeap.fromArray(nodes, compareNodes);
    this.heaps.set(sessionId, heap);
    this.logger.log(`Rebuilt heap for session ${sessionId} with ${nodes.length} entries`);
  }

  /**
   * Clean up a session's heap (when session completes).
   */
  destroySession(sessionId: string): void {
    this.heaps.delete(sessionId);
  }

  // --- Private helpers ---

  private getOrCreateHeap(sessionId: string): MinHeap<QueueNode> {
    let heap = this.heaps.get(sessionId);
    if (!heap) {
      heap = new MinHeap<QueueNode>(compareNodes);
      this.heaps.set(sessionId, heap);
    }
    return heap;
  }

  private zsetKey(sessionId: string): string {
    return `queue:${sessionId}`;
  }

  /**
   * Serialize a QueueNode into a Redis ZSET member string.
   * Format: entryId:patientId:serialNumber
   */
  private serializeMember(node: QueueNode): string {
    return `${node.entryId}:${node.patientId}:${node.serialNumber}`;
  }

  private deserializeMember(member: string, score: number): QueueNode {
    const parts = member.split(':');
    const entryId = parts[0];
    const patientId = parts[1];
    const serialStr = parts[2];

    if (!entryId || !patientId || !serialStr) {
      throw new Error(`Invalid queue member format: "${member}"`);
    }

    return {
      entryId,
      patientId,
      serialNumber: parseInt(serialStr, 10),
      priorityScore: score,
    };
  }
}
