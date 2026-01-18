/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.use-case';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import { AuditService } from '@audit/application/services/audit.service';
import { User } from '@users/domain/entities/user.entity';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let repository: jest.Mocked<IUserRepository>;
  let auditService: jest.Mocked<AuditService>;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUser: User = new User(
    userId,
    'test@example.com',
    'Test User',
    'hashedPassword',
    true, // isActive
    null, // deletedAt
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IUserRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockAuditService: jest.Mocked<AuditService> = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    repository = module.get(USER_REPOSITORY_TOKEN);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should soft delete user successfully', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue();
      auditService.log.mockResolvedValue();

      await useCase.execute(userId, {
        userId: 'audit-user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(repository.findById).toHaveBeenCalledWith(userId);
      // Soft delete: sets isActive to false instead of physical deletion
      expect(repository.delete).toHaveBeenCalledWith(userId);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'User',
          entityId: userId,
          action: 'DELETE',
        }),
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(userId)).rejects.toThrow(
        `User with id ${userId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(userId);
      // Should not attempt soft delete if user doesn't exist
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is already soft deleted', async () => {
      // findById returns null for soft-deleted users
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should work without audit service', async () => {
      const moduleWithoutAudit: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteUserUseCase,
          {
            provide: USER_REPOSITORY_TOKEN,
            useValue: repository,
          },
        ],
      }).compile();

      const useCaseWithoutAudit =
        moduleWithoutAudit.get<DeleteUserUseCase>(DeleteUserUseCase);

      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue();

      await expect(useCaseWithoutAudit.execute(userId)).resolves.not.toThrow();

      expect(repository.delete).toHaveBeenCalledWith(userId);
    });
  });
});
