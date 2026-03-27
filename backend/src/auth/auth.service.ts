import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ phone: dto.phone }, ...(dto.email ? [{ email: dto.email }] : [])],
    });
    if (existing) {
      throw new ConflictException('User with this phone or email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = this.userRepo.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      role: dto.role,
      passwordHash,
    });

    return this.userRepo.save(user);
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: TokenPair }> {
    const user = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);
    return { user, tokens };
  }

  async refresh(userId: string): Promise<TokenPair> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      phone: user.phone,
    };

    const accessOpts = {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRY', '15m'),
    };
    const refreshOpts = {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY', '7d'),
    };

    const [accessToken, refreshToken] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.jwtService.signAsync(payload, accessOpts as any),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.jwtService.signAsync({ sub: user.id, role: user.role }, refreshOpts as any),
    ]);

    return { accessToken, refreshToken };
  }
}
