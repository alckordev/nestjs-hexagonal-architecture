/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteUserUseCase } from './delete-user.use-case';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
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
        DeleteUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    repository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should delete user successfully', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue();

      await useCase.execute(userId);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(userId)).rejects.toThrow(
        `User with id ${userId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
