import { InjectionToken } from '@nestjs/common';
import type { ITokenBlacklistRepository } from './token-blacklist.repository.port';

export const TOKEN_BLACKLIST_REPOSITORY_TOKEN: InjectionToken<ITokenBlacklistRepository> =
  'ITokenBlacklistRepository';
