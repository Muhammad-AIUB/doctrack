import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { QueueGateway } from './queue.gateway.js';
import { QueueModule } from '../queue/queue.module.js';

@Module({
  imports: [ConfigModule, JwtModule.register({}), QueueModule],
  providers: [QueueGateway],
})
export class RealtimeModule {}
