import { InjectionToken } from '@nestjs/common';
import type { IUserRepository } from './user.repository.port';

export const USER_REPOSITORY_TOKEN: InjectionToken<IUserRepository> =
  'IUserRepository';
