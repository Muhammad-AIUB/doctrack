import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationLog } from './entities/consultation-log.entity.js';
import { ConsultationLogService } from './consultation-log.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultationLog])],
  providers: [ConsultationLogService],
  exports: [ConsultationLogService],
})
export class ConsultationLogModule {}
