import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // userId
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    const expiresIn = this.config.get<JwtSignOptions['expiresIn']>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
      '15m',
    );

    return this.jwtService.sign(payload, {
      expiresIn,
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    const expiresIn = this.config.get<JwtSignOptions['expiresIn']>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
      '7d',
    );
    const secret = this.config.get<string>('JWT_REFRESH_TOKEN_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not configured');
    }

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    const secret = this.config.get<string>('JWT_ACCESS_TOKEN_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET is not configured');
    }

    return this.jwtService.verify<JwtPayload>(token, { secret });
  }

  verifyRefreshToken(token: string): JwtPayload {
    const secret = this.config.get<string>('JWT_REFRESH_TOKEN_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_TOKEN_SECRET is not configured');
    }

    return this.jwtService.verify<JwtPayload>(token, { secret });
  }

  getAccessTokenExpiration(): Date {
    const expiresIn = this.config.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
      '15m',
    );
    const milliseconds = this.parseExpirationToMilliseconds(expiresIn);
    return new Date(Date.now() + milliseconds);
  }

  getRefreshTokenExpiration(): Date {
    const expiresIn = this.config.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
      '7d',
    );
    const milliseconds = this.parseExpirationToMilliseconds(expiresIn);
    return new Date(Date.now() + milliseconds);
  }

  private parseExpirationToMilliseconds(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = Number.parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        // Default to minutes if unit is not recognized
        return Number.parseInt(expiresIn, 10) * 60 * 1000;
    }
  }
}
