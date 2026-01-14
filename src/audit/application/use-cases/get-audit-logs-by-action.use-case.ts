import { Injectable, Inject } from '@nestjs/common';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';

@Injectable()
export class GetAuditLogsByActionUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly repository: IAuditLogRepository,
  ) {}

  async execute(action: string, limit?: number): Promise<AuditLog[]> {
    return await this.repository.findByAction(action, limit);
  }
}
