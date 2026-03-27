import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chamber } from './entities/chamber.entity.js';
import { ChambersService } from './chambers.service.js';
import { ChambersController } from './chambers.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Chamber])],
  controllers: [ChambersController],
  providers: [ChambersService],
  exports: [ChambersService],
})
export class ChambersModule {}
