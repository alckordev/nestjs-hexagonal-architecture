import { InjectionToken } from '@nestjs/common';
import type { IAuditLogRepository } from './audit-log.repository.port';

export const AUDIT_LOG_REPOSITORY_TOKEN: InjectionToken<IAuditLogRepository> =
  'IAuditLogRepository';
