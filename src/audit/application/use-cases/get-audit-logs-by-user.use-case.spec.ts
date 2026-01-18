/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetAuditLogsByUserUseCase } from './get-audit-logs-by-user.use-case';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

describe('GetAuditLogsByUserUseCase', () => {
  let useCase: GetAuditLogsByUserUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  const userId = 'user-id';

  const mockAuditLogs: AuditLog[] = [
    AuditLog.fromDynamoDB({
      id: 'audit-log-1',
      entityType: 'User',
      entityId: userId,
      action: 'LOGIN',
      userId,
      changes: null,
      metadata: null,
      createdAt: Date.now(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    }),
    AuditLog.fromDynamoDB({
      id: 'audit-log-2',
      entityType: 'Invoice',
      entityId: 'invoice-id',
      action: 'CREATE',
      userId,
      changes: { amount: 100 },
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
        GetAuditLogsByUserUseCase,
        {
          provide: AUDIT_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAuditLogsByUserUseCase>(GetAuditLogsByUserUseCase);
    repository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return audit logs for a specific user', async () => {
      repository.findByUser.mockResolvedValue(mockAuditLogs);

      const result = await useCase.execute(userId);

      expect(repository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockAuditLogs);
      expect(result.length).toBe(2);
      expect(result.every((log) => log.userId === userId)).toBe(true);
    });

    it('should return empty array if user has no audit logs', async () => {
      repository.findByUser.mockResolvedValue([]);

      const result = await useCase.execute(userId);

      expect(repository.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
