import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailySession } from './entities/daily-session.entity.js';
import { SessionsService } from './sessions.service.js';
import { SessionsController } from './sessions.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([DailySession])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
