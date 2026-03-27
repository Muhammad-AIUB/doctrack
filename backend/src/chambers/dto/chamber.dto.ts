import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength, Min, Max } from 'class-validator';

export class CreateChamberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  defaultAvgDurationMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxPatientsPerSession?: number;
}

export class UpdateChamberDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  defaultAvgDurationMin?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxPatientsPerSession?: number;
}
