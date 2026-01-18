import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DynamoDBService } from '@database/dynamodb/dynamodb.service';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import { CreateAuditLogData } from '@audit/domain/ports/audit-log.repository.port';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Mock uuid before importing the adapter
jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}));

// Mock DynamoDBService before importing the adapter
jest.mock('@database/dynamodb/dynamodb.service', () => {
  return {
    DynamoDBService: jest.fn().mockImplementation(() => ({
      getDocumentClient: jest.fn(),
    })),
  };
});

import { DynamoDBAuditLogRepositoryAdapter } from './dynamodb-audit-log.repository.adapter';

describe('DynamoDBAuditLogRepositoryAdapter', () => {
  let adapter: DynamoDBAuditLogRepositoryAdapter;
  let dynamoDBService: jest.Mocked<DynamoDBService>;
  let configService: jest.Mocked<ConfigService>;
  let docClient: jest.Mocked<DynamoDBDocumentClient>;

  const mockTableName = 'audit-logs';
  const mockId = '123e4567-e89b-12d3-a456-426614174000';
  const mockCreatedAt = 1234567890;

  beforeEach(async () => {
    docClient = {
      send: jest.fn(),
    } as unknown as jest.Mocked<DynamoDBDocumentClient>;

    const mockDynamoDBService = {
      getDocumentClient: jest.fn().mockReturnValue(docClient),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue(mockTableName),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamoDBAuditLogRepositoryAdapter,
        {
          provide: DynamoDBService,
          useValue: mockDynamoDBService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<DynamoDBAuditLogRepositoryAdapter>(
      DynamoDBAuditLogRepositoryAdapter,
    );
    dynamoDBService = module.get(DynamoDBService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an audit log and return AuditLog entity', async () => {
      const createData: CreateAuditLogData = {
        entityType: 'User',
        entityId: 'user-id',
        action: 'CREATE',
        userId: 'user-id',
        changes: { name: 'Test User' },
        metadata: { ip: '192.168.1.1' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      docClient.send.mockResolvedValue({});

      const result = await adapter.create(createData);

      expect(docClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
      expect(docClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: mockTableName,
            Item: expect.objectContaining({
              entityType: createData.entityType,
              entityId: createData.entityId,
              action: createData.action,
              userId: createData.userId,
              changes: createData.changes,
              metadata: createData.metadata,
              ipAddress: createData.ipAddress,
              userAgent: createData.userAgent,
            }),
          }),
        }),
      );
      expect(result).toBeInstanceOf(AuditLog);
      expect(result.entityType).toBe(createData.entityType);
      expect(result.entityId).toBe(createData.entityId);
      expect(result.action).toBe(createData.action);
    });

    it('should create audit log without optional fields', async () => {
      const createData: CreateAuditLogData = {
        entityType: 'User',
        entityId: 'user-id',
        action: 'CREATE',
        userId: null,
        changes: null,
        metadata: null,
        ipAddress: null,
        userAgent: null,
      };

      docClient.send.mockResolvedValue({});

      const result = await adapter.create(createData);

      expect(docClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input.Item).not.toHaveProperty('userId');
      expect(callArg.input.Item).not.toHaveProperty('changes');
      expect(callArg.input.Item).not.toHaveProperty('metadata');
      expect(callArg.input.Item).not.toHaveProperty('ipAddress');
      expect(callArg.input.Item).not.toHaveProperty('userAgent');
      expect(result).toBeInstanceOf(AuditLog);
    });
  });

  describe('findById', () => {
    it('should return an AuditLog when found', async () => {
      const mockItem = {
        id: mockId,
        entityType: 'User',
        entityId: 'user-id',
        action: 'CREATE',
        userId: 'user-id',
        createdAt: mockCreatedAt,
      };

      docClient.send.mockResolvedValue({ Item: mockItem });

      const result = await adapter.findById(mockId);

      expect(docClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
      expect(docClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: mockTableName,
            Key: { id: mockId },
          }),
        }),
      );
      expect(result).toBeInstanceOf(AuditLog);
      expect(result?.id).toBe(mockId);
    });

    it('should return null when audit log not found', async () => {
      docClient.send.mockResolvedValue({});

      const result = await adapter.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEntity', () => {
    it('should return an array of AuditLogs for an entity', async () => {
      const mockItems = [
        {
          id: mockId,
          entityType: 'User',
          entityId: 'user-id',
          action: 'CREATE',
          createdAt: mockCreatedAt,
        },
        {
          id: 'another-id',
          entityType: 'User',
          entityId: 'user-id',
          action: 'UPDATE',
          createdAt: mockCreatedAt + 1000,
        },
      ];

      docClient.send.mockResolvedValue({ Items: mockItems });

      const result = await adapter.findByEntity('User', 'user-id');

      expect(docClient.send).toHaveBeenCalledWith(
        expect.any(QueryCommand),
      );
      expect(docClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: mockTableName,
            IndexName: 'EntityTypeEntityIdIndex',
            KeyConditionExpression: 'entityTypeEntityId = :entityTypeEntityId',
          }),
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(AuditLog);
    });

    it('should return empty array when no audit logs found', async () => {
      docClient.send.mockResolvedValue({ Items: [] });

      const result = await adapter.findByEntity('User', 'user-id');

      expect(result).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('should return an array of AuditLogs for a user', async () => {
      const mockItems = [
        {
          id: mockId,
          entityType: 'User',
          entityId: 'user-id',
          action: 'LOGIN',
          userId: 'user-id',
          createdAt: mockCreatedAt,
        },
      ];

      docClient.send.mockResolvedValue({ Items: mockItems });

      const result = await adapter.findByUser('user-id');

      expect(docClient.send).toHaveBeenCalledWith(
        expect.any(QueryCommand),
      );
      expect(docClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: mockTableName,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
          }),
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AuditLog);
    });
  });

  describe('findByAction', () => {
    it('should return an array of AuditLogs for an action', async () => {
      const mockItems = [
        {
          id: mockId,
          entityType: 'User',
          entityId: 'user-id',
          action: 'LOGIN',
          createdAt: mockCreatedAt + 2000,
        },
        {
          id: 'another-id',
          entityType: 'User',
          entityId: 'another-user-id',
          action: 'LOGIN',
          createdAt: mockCreatedAt + 1000,
        },
      ];

      docClient.send.mockResolvedValue({ Items: mockItems });

      const result = await adapter.findByAction('LOGIN', 10);

      expect(docClient.send).toHaveBeenCalledWith(
        expect.any(ScanCommand),
      );
      expect(docClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: mockTableName,
            FilterExpression: '#action = :action',
            Limit: 10,
          }),
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(AuditLog);
    });

    it('should normalize action to uppercase', async () => {
      const mockItems: unknown[] = [];
      docClient.send.mockResolvedValue({ Items: mockItems });

      await adapter.findByAction('login', 10);

      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input.ExpressionAttributeValues[':action']).toBe('LOGIN');
    });

    it('should use default limit of 100 if not provided', async () => {
      const mockItems: unknown[] = [];
      docClient.send.mockResolvedValue({ Items: mockItems });

      await adapter.findByAction('LOGIN');

      const callArg = (docClient.send as jest.Mock).mock.calls[0][0];
      expect(callArg.input.Limit).toBe(100);
    });
  });
});
