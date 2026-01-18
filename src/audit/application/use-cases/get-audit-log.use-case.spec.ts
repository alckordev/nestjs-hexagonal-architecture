/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAuditLogUseCase } from './get-audit-log.use-case';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

describe('GetAuditLogUseCase', () => {
  let useCase: GetAuditLogUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  const auditLogId = 'audit-log-id';
  const mockAuditLog: AuditLog = AuditLog.fromDynamoDB({
    id: auditLogId,
    entityType: 'User',
    entityId: 'user-id',
    action: 'CREATE',
    userId: 'audit-user-id',
    changes: { email: 'test@example.com' },
    metadata: { source: 'web' },
    createdAt: Date.now(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  });

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
        GetAuditLogUseCase,
        {
          provide: AUDIT_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAuditLogUseCase>(GetAuditLogUseCase);
    repository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return an audit log by id', async () => {
      repository.findById.mockResolvedValue(mockAuditLog);

      const result = await useCase.execute(auditLogId);

      expect(repository.findById).toHaveBeenCalledWith(auditLogId);
      expect(result).toEqual(mockAuditLog);
    });

    it('should throw NotFoundException if audit log does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(auditLogId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(auditLogId)).rejects.toThrow(
        `Audit log with id ${auditLogId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(auditLogId);
    });
  });
});
