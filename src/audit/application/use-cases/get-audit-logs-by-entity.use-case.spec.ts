/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetAuditLogsByEntityUseCase } from './get-audit-logs-by-entity.use-case';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

describe('GetAuditLogsByEntityUseCase', () => {
  let useCase: GetAuditLogsByEntityUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  const entityType = 'User';
  const entityId = 'user-id';

  const mockAuditLogs: AuditLog[] = [
    AuditLog.fromDynamoDB({
      id: 'audit-log-1',
      entityType,
      entityId,
      action: 'CREATE',
      userId: 'user-id',
      changes: { email: 'test@example.com' },
      metadata: null,
      createdAt: Date.now(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    }),
    AuditLog.fromDynamoDB({
      id: 'audit-log-2',
      entityType,
      entityId,
      action: 'UPDATE',
      userId: 'user-id',
      changes: { name: 'Updated Name' },
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
        GetAuditLogsByEntityUseCase,
        {
          provide: AUDIT_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAuditLogsByEntityUseCase>(
      GetAuditLogsByEntityUseCase,
    );
    repository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return audit logs for a specific entity', async () => {
      repository.findByEntity.mockResolvedValue(mockAuditLogs);

      const result = await useCase.execute(entityType, entityId);

      expect(repository.findByEntity).toHaveBeenCalledWith(
        entityType,
        entityId,
      );
      expect(result).toEqual(mockAuditLogs);
      expect(result.length).toBe(2);
      expect(
        result.every(
          (log) => log.entityType === entityType && log.entityId === entityId,
        ),
      ).toBe(true);
    });

    it('should return empty array if entity has no audit logs', async () => {
      repository.findByEntity.mockResolvedValue([]);

      const result = await useCase.execute(entityType, entityId);

      expect(repository.findByEntity).toHaveBeenCalledWith(
        entityType,
        entityId,
      );
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
