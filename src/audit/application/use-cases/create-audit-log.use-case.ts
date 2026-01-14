import { Injectable, Inject } from '@nestjs/common';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';
import { CreateAuditLogDto } from '@audit/application/dto/create-audit-log.dto';

@Injectable()
export class CreateAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly repository: IAuditLogRepository,
  ) {}

  async execute(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return await this.repository.create({
      entityType: createAuditLogDto.entityType,
      entityId: createAuditLogDto.entityId,
      action: createAuditLogDto.action,
      userId: createAuditLogDto.userId,
      changes: createAuditLogDto.changes,
      metadata: createAuditLogDto.metadata,
      ipAddress: createAuditLogDto.ipAddress,
      userAgent: createAuditLogDto.userAgent,
    });
  }
}
