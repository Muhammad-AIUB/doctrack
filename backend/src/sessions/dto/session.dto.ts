import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SessionStatus } from '../../common/enums/index.js';

export class CreateSessionDto {
  @IsDateString()
  sessionDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  etaWindowSize?: number;
}

export class UpdateSessionStatusDto {
  @IsEnum(SessionStatus)
  status!: SessionStatus;
}
