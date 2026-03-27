import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailySession } from './entities/daily-session.entity.js';
import { SessionStatus } from '../common/enums/index.js';
import { CreateSessionDto, UpdateSessionStatusDto } from './dto/session.dto.js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(DailySession)
    private readonly sessionRepo: Repository<DailySession>,
  ) {}

  async create(chamberId: string, dto: CreateSessionDto): Promise<DailySession> {
    const existing = await this.sessionRepo.findOne({
      where: { chamberId, sessionDate: dto.sessionDate },
    });
    if (existing) {
      throw new ConflictException(
        `Session already exists for chamber on ${dto.sessionDate}`,
      );
    }

    const session = this.sessionRepo.create({
      chamberId,
      sessionDate: dto.sessionDate,
      etaWindowSize: dto.etaWindowSize ?? 10,
      status: SessionStatus.SCHEDULED,
    });
    return this.sessionRepo.save(session);
  }

  async findById(id: string): Promise<DailySession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['chamber'],
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async findByChamberAndDate(
    chamberId: string,
    date: string,
  ): Promise<DailySession | null> {
    return this.sessionRepo.findOne({
      where: { chamberId, sessionDate: date },
    });
  }

  async findActiveByChamberId(chamberId: string): Promise<DailySession | null> {
    return this.sessionRepo.findOne({
      where: { chamberId, status: SessionStatus.ACTIVE },
    });
  }

  async updateStatus(
    id: string,
    dto: UpdateSessionStatusDto,
  ): Promise<DailySession> {
    const session = await this.findById(id);
    const allowed = this.getAllowedTransitions(session.status);

    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${session.status} to ${dto.status}`,
      );
    }

    if (dto.status === SessionStatus.ACTIVE && !session.actualStartTime) {
      session.actualStartTime = new Date();
    }

    if (
      dto.status === SessionStatus.COMPLETED ||
      dto.status === SessionStatus.CANCELLED
    ) {
      session.actualEndTime = new Date();
    }

    session.status = dto.status;
    return this.sessionRepo.save(session);
  }

  async incrementPatientsServed(id: string): Promise<void> {
    await this.sessionRepo.increment({ id }, 'totalPatientsServed', 1);
  }

  private getAllowedTransitions(current: SessionStatus): SessionStatus[] {
    const transitions: Record<SessionStatus, SessionStatus[]> = {
      [SessionStatus.SCHEDULED]: [SessionStatus.ACTIVE, SessionStatus.CANCELLED],
      [SessionStatus.ACTIVE]: [SessionStatus.PAUSED, SessionStatus.COMPLETED],
      [SessionStatus.PAUSED]: [SessionStatus.ACTIVE, SessionStatus.COMPLETED],
      [SessionStatus.COMPLETED]: [],
      [SessionStatus.CANCELLED]: [],
    };
    return transitions[current];
  }
}
