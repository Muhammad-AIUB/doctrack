import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export interface RefreshPayload {
  sub: string;
  role: string;
}

function extractRefreshFromCookie(req: Request): string | null {
  return req?.cookies?.['refresh_token'] ?? null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshFromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    });
  }

  validate(payload: RefreshPayload): RefreshPayload {
    return payload;
  }
}
