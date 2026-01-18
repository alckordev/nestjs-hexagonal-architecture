/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAuditLogUseCase } from './create-audit-log.use-case';
import type { IAuditLogRepository } from '@audit/domain/ports/audit-log.repository.port';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '@audit/domain/ports/audit-log.repository.token';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

describe('CreateAuditLogUseCase', () => {
  let useCase: CreateAuditLogUseCase;
  let repository: jest.Mocked<IAuditLogRepository>;

  const createAuditLogDto: CreateAuditLogDto = {
    entityType: 'User',
    entityId: 'user-id',
    action: 'CREATE',
    userId: 'audit-user-id',
    changes: { email: 'test@example.com', name: 'Test User' },
    metadata: { source: 'web' },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
  };

  const mockAuditLog: AuditLog = AuditLog.fromDynamoDB({
    id: 'audit-log-id',
    entityType: createAuditLogDto.entityType,
    entityId: createAuditLogDto.entityId,
    action: createAuditLogDto.action,
    userId: createAuditLogDto.userId,
    changes: createAuditLogDto.changes,
    metadata: createAuditLogDto.metadata,
    createdAt: Date.now(),
    ipAddress: createAuditLogDto.ipAddress,
    userAgent: createAuditLogDto.userAgent,
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
        CreateAuditLogUseCase,
        {
          provide: AUDIT_LOG_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateAuditLogUseCase>(CreateAuditLogUseCase);
    repository = module.get(AUDIT_LOG_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create an audit log successfully', async () => {
      repository.create.mockResolvedValue(mockAuditLog);

      const result = await useCase.execute(createAuditLogDto);

      expect(repository.create).toHaveBeenCalledWith({
        entityType: createAuditLogDto.entityType,
        entityId: createAuditLogDto.entityId,
        action: createAuditLogDto.action,
        userId: createAuditLogDto.userId,
        changes: createAuditLogDto.changes,
        metadata: createAuditLogDto.metadata,
        ipAddress: createAuditLogDto.ipAddress,
        userAgent: createAuditLogDto.userAgent,
      });
      expect(result).toEqual(mockAuditLog);
    });

    it('should create audit log with null optional fields', async () => {
      const dtoWithNulls: CreateAuditLogDto = {
        entityType: 'User',
        entityId: 'user-id',
        action: 'LOGIN',
        userId: null,
        changes: null,
        metadata: null,
        ipAddress: null,
        userAgent: null,
      };

      const auditLogWithNulls = AuditLog.fromDynamoDB({
        id: 'audit-log-id',
        entityType: dtoWithNulls.entityType,
        entityId: dtoWithNulls.entityId,
        action: dtoWithNulls.action,
        userId: null,
        changes: null,
        metadata: null,
        createdAt: Date.now(),
        ipAddress: null,
        userAgent: null,
      });

      repository.create.mockResolvedValue(auditLogWithNulls);

      const result = await useCase.execute(dtoWithNulls);

      expect(repository.create).toHaveBeenCalledWith({
        entityType: dtoWithNulls.entityType,
        entityId: dtoWithNulls.entityId,
        action: dtoWithNulls.action,
        userId: null,
        changes: null,
        metadata: null,
        ipAddress: null,
        userAgent: null,
      });
      expect(result).toEqual(auditLogWithNulls);
    });
  });
});
