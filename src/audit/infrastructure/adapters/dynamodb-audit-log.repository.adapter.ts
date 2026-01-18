import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBService } from '@database/dynamodb/dynamodb.service';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import {
  type IAuditLogRepository,
  CreateAuditLogData,
} from '@audit/domain/ports/audit-log.repository.port';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
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

    // Build item without null values (DynamoDB doesn't support null)
    const item: Record<string, unknown> = {
      id,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      createdAt,
      // GSI keys
      entityTypeEntityId: `${data.entityType}#${data.entityId}`,
    };

    // Only add optional fields if they have values (not null/undefined)
    // DynamoDB doesn't support null values
    if (data.userId != null) {
      item.userId = data.userId;
    }
    if (data.changes != null) {
      item.changes = data.changes;
    }
    if (data.metadata != null) {
      item.metadata = data.metadata;
    }
    if (data.ipAddress != null) {
      item.ipAddress = data.ipAddress;
    }
    if (data.userAgent != null) {
      item.userAgent = data.userAgent;
    }

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
    // Note: Using Scan with FilterExpression (not ideal for production)
    // For better performance, consider adding a GSI with action as partition key
    const docClient = this.dynamoDBService.getDocumentClient();

    // Normalize action to uppercase for consistent comparison
    // Actions are stored in uppercase (e.g., LOGIN, CREATE, UPDATE, DELETE)
    const normalizedAction = action.toUpperCase();

    // "action" is a reserved keyword in DynamoDB, so we need to use ExpressionAttributeNames
    const result = await docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: '#action = :action',
        ExpressionAttributeNames: {
          '#action': 'action',
        },
        ExpressionAttributeValues: {
          ':action': normalizedAction,
        },
        Limit: limit,
      }),
    );

    // Sort by createdAt descending (newest first)
    const items = (result.Items || []).sort((a, b) => {
      const aTime = (a.createdAt as number) || 0;
      const bTime = (b.createdAt as number) || 0;
      return bTime - aTime;
    });

    return items
      .slice(0, limit)
      .map((item) =>
        AuditLog.fromDynamoDB(
          item as Parameters<typeof AuditLog.fromDynamoDB>[0],
        ),
      );
  }
}
