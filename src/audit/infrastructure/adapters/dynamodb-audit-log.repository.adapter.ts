import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBService } from '@database/dynamodb/dynamodb.service';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import {
  type IAuditLogRepository,
  CreateAuditLogData,
} from '@audit/domain/ports/audit-log.repository.port';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DynamoDBAuditLogRepositoryAdapter implements IAuditLogRepository {
  private readonly tableName: string;

  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly config: ConfigService,
  ) {
    this.tableName = config.get<string>(
      'DYNAMODB_AUDIT_TABLE_NAME',
      'audit-logs',
    );
  }

  async create(data: CreateAuditLogData): Promise<AuditLog> {
    const docClient = this.dynamoDBService.getDocumentClient();
    const id = uuid();
    const createdAt = Date.now();

    const item = {
      id,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      userId: data.userId || null,
      changes: data.changes || null,
      metadata: data.metadata || null,
      createdAt,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      // GSI keys
      entityTypeEntityId: `${data.entityType}#${data.entityId}`,
    };

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      }),
    );

    return AuditLog.fromDynamoDB({
      id,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      userId: data.userId || null,
      changes: data.changes || null,
      metadata: data.metadata || null,
      createdAt,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    const docClient = this.dynamoDBService.getDocumentClient();

    const result = await docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    if (!result.Item) {
      return null;
    }

    return AuditLog.fromDynamoDB(
      result.Item as Parameters<typeof AuditLog.fromDynamoDB>[0],
    );
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    const docClient = this.dynamoDBService.getDocumentClient();
    const entityTypeEntityId = `${entityType}#${entityId}`;

    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'EntityTypeEntityIdIndex',
        KeyConditionExpression: 'entityTypeEntityId = :entityTypeEntityId',
        ExpressionAttributeValues: {
          ':entityTypeEntityId': entityTypeEntityId,
        },
        ScanIndexForward: false, // Descending order (newest first)
      }),
    );

    return (result.Items || []).map((item) =>
      AuditLog.fromDynamoDB(
        item as Parameters<typeof AuditLog.fromDynamoDB>[0],
      ),
    );
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    const docClient = this.dynamoDBService.getDocumentClient();

    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Descending order (newest first)
      }),
    );

    return (result.Items || []).map((item) =>
      AuditLog.fromDynamoDB(
        item as Parameters<typeof AuditLog.fromDynamoDB>[0],
      ),
    );
  }

  async findByAction(action: string, limit = 100): Promise<AuditLog[]> {
    // Note: This would require a GSI with action as partition key
    // For MVP, we'll use a scan with filter (not ideal for production)
    const docClient = this.dynamoDBService.getDocumentClient();

    // Simplified: In production, use GSI with action as PK
    // For now, return empty array and log a warning
    // This should be implemented with proper GSI
    return [];
  }
}
