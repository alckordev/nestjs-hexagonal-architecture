/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { GetAuditLogUseCase } from '@audit/application/use-cases/get-audit-log.use-case';
import { GetAuditLogsByEntityUseCase } from '@audit/application/use-cases/get-audit-logs-by-entity.use-case';
import { GetAuditLogsByUserUseCase } from '@audit/application/use-cases/get-audit-logs-by-user.use-case';
import { GetAuditLogsByActionUseCase } from '@audit/application/use-cases/get-audit-logs-by-action.use-case';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let getAuditLogUseCase: jest.Mocked<GetAuditLogUseCase>;
  let getAuditLogsByEntityUseCase: jest.Mocked<GetAuditLogsByEntityUseCase>;
  let getAuditLogsByUserUseCase: jest.Mocked<GetAuditLogsByUserUseCase>;
  let getAuditLogsByActionUseCase: jest.Mocked<GetAuditLogsByActionUseCase>;

  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const mockAuditLog: AuditLog = new AuditLog(
    '123e4567-e89b-12d3-a456-426614174000',
    'User',
    'user-id',
    'CREATE',
    'user-id',
    { name: 'Test User' },
    { ip: '192.168.1.1' },
    mockDate,
    '192.168.1.1',
    'Mozilla/5.0',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: GetAuditLogUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAuditLogsByEntityUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAuditLogsByUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAuditLogsByActionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    getAuditLogUseCase = module.get(GetAuditLogUseCase);
    getAuditLogsByEntityUseCase = module.get(GetAuditLogsByEntityUseCase);
    getAuditLogsByUserUseCase = module.get(GetAuditLogsByUserUseCase);
    getAuditLogsByActionUseCase = module.get(GetAuditLogsByActionUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return an AuditLogResponseDto by id', async () => {
      const auditLogId = mockAuditLog.id;
      getAuditLogUseCase.execute.mockResolvedValue(mockAuditLog);

      const result = await controller.findOne(auditLogId);

      expect(getAuditLogUseCase.execute).toHaveBeenCalledWith(auditLogId);
      expect(result).toEqual({
        id: mockAuditLog.id,
        entityType: mockAuditLog.entityType,
        entityId: mockAuditLog.entityId,
        action: mockAuditLog.action,
        userId: mockAuditLog.userId,
        changes: mockAuditLog.changes,
        metadata: mockAuditLog.metadata,
        createdAt: mockAuditLog.createdAt,
        ipAddress: mockAuditLog.ipAddress,
        userAgent: mockAuditLog.userAgent,
      });
    });
  });

  describe('findByEntity', () => {
    it('should return an array of AuditLogResponseDto for an entity', async () => {
      const entityType = 'User';
      const entityId = 'user-id';
      const mockAuditLogs = [mockAuditLog];
      getAuditLogsByEntityUseCase.execute.mockResolvedValue(mockAuditLogs);

      const result = await controller.findByEntity(entityType, entityId);

      expect(getAuditLogsByEntityUseCase.execute).toHaveBeenCalledWith(
        entityType,
        entityId,
      );
      expect(result).toHaveLength(1);
      expect(result[0].entityType).toBe(entityType);
      expect(result[0].entityId).toBe(entityId);
    });
  });

  describe('findByUser', () => {
    it('should return an array of AuditLogResponseDto for a user', async () => {
      const userId = 'user-id';
      const mockAuditLogs = [mockAuditLog];
      getAuditLogsByUserUseCase.execute.mockResolvedValue(mockAuditLogs);

      const result = await controller.findByUser(userId);

      expect(getAuditLogsByUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(userId);
    });
  });

  describe('findByAction', () => {
    it('should return an array of AuditLogResponseDto for an action', async () => {
      const action = 'LOGIN';
      const mockAuditLogs = [mockAuditLog];
      getAuditLogsByActionUseCase.execute.mockResolvedValue(mockAuditLogs);

      const result = await controller.findByAction(action);

      expect(getAuditLogsByActionUseCase.execute).toHaveBeenCalledWith(
        action,
        undefined,
      );
      expect(result).toHaveLength(1);
      expect(result[0].action).toBe(mockAuditLog.action);
    });

    it('should pass limit parameter when provided', async () => {
      const action = 'LOGIN';
      const limit = '10';
      const mockAuditLogs = [mockAuditLog];
      getAuditLogsByActionUseCase.execute.mockResolvedValue(mockAuditLogs);

      const result = await controller.findByAction(action, limit);

      expect(getAuditLogsByActionUseCase.execute).toHaveBeenCalledWith(
        action,
        10,
      );
      expect(result).toHaveLength(1);
    });
  });
});
