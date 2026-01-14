export class AuditLogResponseDto {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}
