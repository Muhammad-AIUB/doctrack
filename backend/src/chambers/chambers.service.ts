import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chamber } from './entities/chamber.entity.js';
import { CreateChamberDto, UpdateChamberDto } from './dto/chamber.dto.js';

@Injectable()
export class ChambersService {
  constructor(
    @InjectRepository(Chamber) private readonly chamberRepo: Repository<Chamber>,
  ) {}

  async create(doctorId: string, dto: CreateChamberDto): Promise<Chamber> {
    const chamber = this.chamberRepo.create({
      doctorId,
      name: dto.name,
      address: dto.address ?? null,
      defaultAvgDurationMin: dto.defaultAvgDurationMin ?? 10,
      maxPatientsPerSession: dto.maxPatientsPerSession ?? null,
    });
    return this.chamberRepo.save(chamber);
  }

  async findByDoctor(doctorId: string): Promise<Chamber[]> {
    return this.chamberRepo.find({
      where: { doctorId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Chamber> {
    const chamber = await this.chamberRepo.findOne({
      where: { id },
      relations: ['doctor'],
    });
    if (!chamber) throw new NotFoundException(`Chamber ${id} not found`);
    return chamber;
  }

  async update(id: string, doctorId: string, dto: UpdateChamberDto): Promise<Chamber> {
    const chamber = await this.findById(id);
    if (chamber.doctorId !== doctorId) {
      throw new ForbiddenException('You can only update your own chambers');
    }
    Object.assign(chamber, dto);
    return this.chamberRepo.save(chamber);
  }

  async deactivate(id: string, doctorId: string): Promise<Chamber> {
    const chamber = await this.findById(id);
    if (chamber.doctorId !== doctorId) {
      throw new ForbiddenException('You can only deactivate your own chambers');
    }
    chamber.isActive = false;
    return this.chamberRepo.save(chamber);
  }
}
