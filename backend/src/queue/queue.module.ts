import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueEntry } from './entities/queue-entry.entity.js';
import { QueueService } from './queue.service.js';
import { QueueController } from './queue.controller.js';
import { EtaModule } from '../eta/eta.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { ConsultationLogModule } from '../consultation-log/consultation-log.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([QueueEntry]),
    EtaModule,
    SessionsModule,
    ConsultationLogModule,
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
