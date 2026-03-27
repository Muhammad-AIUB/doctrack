import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SessionsService } from './sessions.service.js';
import { CreateSessionDto, UpdateSessionStatusDto } from './dto/session.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/index.js';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('chambers/:chamberId/sessions')
  @Roles(UserRole.DOCTOR, UserRole.ASSISTANT)
  async create(
    @Param('chamberId', ParseUUIDPipe) chamberId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(chamberId, dto);
  }

  @Get('sessions/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionsService.findById(id);
  }

  @Get('chambers/:chamberId/sessions/active')
  async findActive(@Param('chamberId', ParseUUIDPipe) chamberId: string) {
    return this.sessionsService.findActiveByChamberId(chamberId);
  }

  @Get('chambers/:chamberId/sessions')
  async findByDate(
    @Param('chamberId', ParseUUIDPipe) chamberId: string,
    @Query('date') date: string,
  ) {
    return this.sessionsService.findByChamberAndDate(chamberId, date);
  }

  @Patch('sessions/:id/status')
  @Roles(UserRole.DOCTOR, UserRole.ASSISTANT)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    return this.sessionsService.updateStatus(id, dto);
  }
}
