/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserUseCase } from './get-user.use-case';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let repository: jest.Mocked<IUserRepository>;

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'Test User',
    'hashedPassword',
    true,
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
        GetUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
    repository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a user when found', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(userId);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(userId)).rejects.toThrow(
        `User with id ${userId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(userId);
    });
  });
});
