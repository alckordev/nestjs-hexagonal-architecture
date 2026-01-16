import { InjectionToken } from '@nestjs/common';
import type { IRefreshTokenRepository } from './refresh-token.repository.port';

export const REFRESH_TOKEN_REPOSITORY_TOKEN: InjectionToken<IRefreshTokenRepository> =
  'IRefreshTokenRepository';
