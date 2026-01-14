import { AuditLog } from '../entities/audit-log.entity';

export interface CreateAuditLogData {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  findByUser(userId: string): Promise<AuditLog[]>;
  findByAction(action: string, limit?: number): Promise<AuditLog[]>;
}
