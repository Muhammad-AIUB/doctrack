import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QueueService } from './queue.service.js';
import { CheckInDto } from './dto/queue.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/index.js';

@Controller('api/v1/sessions/:sessionId/queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('check-in')
  @Roles(UserRole.ASSISTANT, UserRole.DOCTOR)
  async checkIn(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: CheckInDto,
  ) {
    return this.queueService.checkIn(sessionId, dto);
  }

  @Post('next')
  @Roles(UserRole.ASSISTANT, UserRole.DOCTOR)
  async nextPatient(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.queueService.advanceQueue(sessionId);
  }

  @Post('skip')
  @Roles(UserRole.ASSISTANT, UserRole.DOCTOR)
  async skipPatient(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.queueService.skipPatient(sessionId);
  }

  @Delete('entries/:entryId')
  @Roles(UserRole.ASSISTANT, UserRole.DOCTOR, UserRole.PATIENT)
  async cancel(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('entryId', ParseUUIDPipe) entryId: string,
  ) {
    await this.queueService.cancelEntry(sessionId, entryId);
    return { message: 'Entry cancelled' };
  }

  @Get()
  async getQueueState(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.queueService.getQueueState(sessionId);
  }
}
