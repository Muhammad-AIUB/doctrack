import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/auth.dto.js';
import { JwtRefreshGuard } from './guards/jwt-auth.guard.js';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1/auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    this.isProduction = config.get<string>('NODE_ENV') === 'production';
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.register(dto);
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request & { user: { sub: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(req.user.sub);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { message: 'Tokens refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return { message: 'Logged out' };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth/refresh',
    });
  }
}
