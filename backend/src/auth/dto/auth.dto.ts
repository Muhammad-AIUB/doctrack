import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/index.js';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
