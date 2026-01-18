/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { AuditService } from '@audit/application/services/audit.service';
import { CreateUserDto } from '../dto/create-user.dto';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repository: jest.Mocked<IUserRepository>;

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'Test User',
    'hashedPassword',
    true,
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    repository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    it('should create a user successfully', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);

      const result = await useCase.execute(createUserDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        `User with email ${createUserDto.email} already exists`,
      );

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create audit log when audit service is available', async () => {
      const mockAuditService: jest.Mocked<AuditService> = {
        log: jest.fn(),
      } as unknown as jest.Mocked<AuditService>;

      const moduleWithAudit: TestingModule = await Test.createTestingModule({
        providers: [
          CreateUserUseCase,
          {
            provide: 'IUserRepository',
            useValue: repository,
          },
          {
            provide: AuditService,
            useValue: mockAuditService,
          },
        ],
      }).compile();

      const useCaseWithAudit =
        moduleWithAudit.get<CreateUserUseCase>(CreateUserUseCase);

      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);
      mockAuditService.log.mockResolvedValue();

      const result = await useCaseWithAudit.execute(createUserDto, {
        userId: 'audit-user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(result).toEqual(mockUser);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'User',
          entityId: mockUser.id,
          action: 'CREATE',
        }),
      );
    });

    it('should work without audit service', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);

      const result = await useCase.execute(createUserDto);

      expect(result).toEqual(mockUser);
    });
  });
});
