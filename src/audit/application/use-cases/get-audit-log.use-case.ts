import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';

@Injectable()
export class GetAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly repository: IAuditLogRepository,
  ) {}

  async execute(id: string): Promise<AuditLog> {
    const auditLog = await this.repository.findById(id);

    if (!auditLog) {
      throw new NotFoundException(`Audit log with id ${id} not found`);
    }

    return auditLog;
  }
}
