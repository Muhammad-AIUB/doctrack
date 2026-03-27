import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { QueuePriority } from '../../common/enums/index.js';

export class CheckInDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsEnum(QueuePriority)
  priority?: QueuePriority;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
