import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/index.js';
import type { JwtPayload } from '../auth/strategies/jwt.strategy.js';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    const found = await this.usersService.findById(user.sub);
    return {
      id: found.id,
      name: found.name,
      phone: found.phone,
      email: found.email,
      role: found.role,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
    }));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.deactivate(id);
    return { id: user.id, isActive: user.isActive };
  }
}
