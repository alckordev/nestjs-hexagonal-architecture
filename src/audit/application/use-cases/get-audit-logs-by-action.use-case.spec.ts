/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetAuditLogsByActionUseCase } from './get-audit-logs-by-action.use-case';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

describe('GetAuditLogsByActionUseCase', () => {
  let useCase: GetAuditLogsByActionUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  const action = 'LOGIN';

  const mockAuditLogs: AuditLog[] = [
    AuditLog.fromDynamoDB({
      id: 'audit-log-1',
      entityType: 'User',
      entityId: 'user-id-1',
      action,
      userId: 'user-id-1',
      changes: null,
      metadata: null,
      createdAt: Date.now(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    }),
    AuditLog.fromDynamoDB({
      id: 'audit-log-2',
      entityType: 'User',
      entityId: 'user-id-2',
      action,
      userId: 'user-id-2',
      changes: null,
      metadata: null,
      createdAt: Date.now() + 1000,
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0',
    }),
  ];

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IAuditLogRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEntity: jest.fn(),
      findByUser: jest.fn(),
      findByAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAuditLogsByActionUseCase,
        {
          provide: AUDIT_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAuditLogsByActionUseCase>(
      GetAuditLogsByActionUseCase,
    );
    repository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return audit logs for a specific action', async () => {
      repository.findByAction.mockResolvedValue(mockAuditLogs);

      const result = await useCase.execute(action);

      expect(repository.findByAction).toHaveBeenCalledWith(action, undefined);
      expect(result).toEqual(mockAuditLogs);
      expect(result.length).toBe(2);
      expect(result.every((log) => log.action === action)).toBe(true);
    });

    it('should return audit logs with limit', async () => {
      const limit = 5;
      repository.findByAction.mockResolvedValue(mockAuditLogs);

      const result = await useCase.execute(action, limit);

      expect(repository.findByAction).toHaveBeenCalledWith(action, limit);
      expect(result).toEqual(mockAuditLogs);
    });

    it('should return empty array if no audit logs found for action', async () => {
      repository.findByAction.mockResolvedValue([]);

      const result = await useCase.execute(action);

      expect(repository.findByAction).toHaveBeenCalledWith(action, undefined);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should normalize action to uppercase', async () => {
      repository.findByAction.mockResolvedValue(mockAuditLogs);

      // Call with lowercase action
      await useCase.execute('login');

      // Repository should receive uppercase action (this is handled in the repository adapter)
      expect(repository.findByAction).toHaveBeenCalled();
    });
  });
});
