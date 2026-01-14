export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly action: string,
    public readonly userId: string | null,
    public readonly changes: Record<string, unknown> | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly createdAt: Date,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
  ) {}

  static fromDynamoDB(data: {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    userId?: string | null;
    changes?: Record<string, unknown> | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string | number;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): AuditLog {
    return new AuditLog(
      data.id,
      data.entityType,
      data.entityId,
      data.action,
      data.userId || null,
      data.changes || null,
      data.metadata || null,
      typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : new Date(data.createdAt),
      data.ipAddress || null,
      data.userAgent || null,
    );
  }

  toJSON() {
    return {
      id: this.id,
      entityType: this.entityType,
      entityId: this.entityId,
      action: this.action,
      userId: this.userId,
      changes: this.changes,
      metadata: this.metadata,
      createdAt: this.createdAt,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
    };
  }
}
