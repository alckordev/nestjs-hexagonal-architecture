import { Injectable } from '@nestjs/common';
import { CreateAuditLogUseCase } from '../use-cases/create-audit-log.use-case';

export interface AuditContext {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly createAuditLogUseCase: CreateAuditLogUseCase) {}

  async log(context: AuditContext): Promise<void> {
    try {
      await this.createAuditLogUseCase.execute({
        entityType: context.entityType,
        entityId: context.entityId,
        action: context.action,
        userId: context.userId || null,
        changes: context.changes || null,
        metadata: context.metadata || null,
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
      });
    } catch (error) {
      // Log error but don't fail the main operation
      // In production, you might want to use a logger here
      console.error('Failed to create audit log:', error);
    }
  }
}
