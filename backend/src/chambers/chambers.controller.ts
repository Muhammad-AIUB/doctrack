import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChambersService } from './chambers.service.js';
import { CreateChamberDto, UpdateChamberDto } from './dto/chamber.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/index.js';
import type { JwtPayload } from '../auth/strategies/jwt.strategy.js';

@Controller('api/v1/chambers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChambersController {
  constructor(private readonly chambersService: ChambersService) {}

  @Post()
  @Roles(UserRole.DOCTOR)
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateChamberDto) {
    return this.chambersService.create(user.sub, dto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.ASSISTANT)
  async findMyChambers(@CurrentUser() user: JwtPayload) {
    return this.chambersService.findByDoctor(user.sub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chambersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateChamberDto,
  ) {
    return this.chambersService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @Roles(UserRole.DOCTOR)
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chambersService.deactivate(id, user.sub);
  }
}
