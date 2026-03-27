import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { QueueService } from '../queue/queue.service.js';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    role?: string;
    sessionId?: string;
  };
}

@WebSocketGateway({
  namespace: '/queue',
  cors: {
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class QueueGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(QueueGateway.name);
  private redisSubscriber: Redis | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly queueService: QueueService,
  ) {}

  afterInit(): void {
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.redisSubscriber = new Redis(redisUrl);

    // Subscribe to all session update channels
    this.redisSubscriber.psubscribe('session:*:updates').catch((err) => {
      this.logger.error('Failed to subscribe to Redis channels', err);
    });

    this.redisSubscriber.on('pmessage', (_pattern, channel, message) => {
      // channel format: session:{sessionId}:updates
      const parts = channel.split(':');
      const sessionId = parts[1];
      if (sessionId) {
        this.server.to(`session:${sessionId}`).emit('queue:updated', JSON.parse(message));
      }
    });

    this.logger.log('WebSocket Gateway initialized with Redis pub/sub');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      // Extract JWT from cookie or auth header
      const token = this.extractToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      // Join session room if sessionId provided in handshake query
      const sessionId = client.handshake.query['sessionId'] as string | undefined;
      if (sessionId && this.isValidUUID(sessionId)) {
        await client.join(`session:${sessionId}`);
        client.data.sessionId = sessionId;

        // Send current state snapshot for catch-up
        const state = await this.queueService.getQueueState(sessionId);
        client.emit('queue:snapshot', state);
      }

      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Client auth failed: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:session')
  async handleJoinSession(
    client: AuthenticatedSocket,
    data: { sessionId: string },
  ): Promise<void> {
    if (!data.sessionId || !this.isValidUUID(data.sessionId)) {
      client.emit('error', { message: 'Invalid sessionId' });
      return;
    }

    // Leave previous session room if any
    if (client.data.sessionId) {
      await client.leave(`session:${client.data.sessionId}`);
    }

    await client.join(`session:${data.sessionId}`);
    client.data.sessionId = data.sessionId;

    // Send current state
    const state = await this.queueService.getQueueState(data.sessionId);
    client.emit('queue:snapshot', state);
  }

  @SubscribeMessage('leave:session')
  async handleLeaveSession(client: AuthenticatedSocket): Promise<void> {
    if (client.data.sessionId) {
      await client.leave(`session:${client.data.sessionId}`);
      client.data.sessionId = undefined;
    }
  }

  @SubscribeMessage('request:catchup')
  async handleCatchup(
    client: AuthenticatedSocket,
    data: { sessionId: string; lastSequence: number },
  ): Promise<void> {
    // For simplicity in free-tier (no Redis Streams on Upstash free),
    // always send a full state snapshot. This is correct and bounded.
    const state = await this.queueService.getQueueState(data.sessionId);
    client.emit('queue:snapshot', state);
  }

  private extractToken(client: Socket): string | null {
    // Try cookie first (browser clients)
    const cookies = client.handshake.headers.cookie;
    if (cookies) {
      const match = cookies.match(/access_token=([^;]+)/);
      if (match?.[1]) return match[1];
    }

    // Fallback to auth header (API/mobile clients)
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    // No query param fallback — tokens in URLs leak into logs and referrer headers
    return null;
  }

  private isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}
