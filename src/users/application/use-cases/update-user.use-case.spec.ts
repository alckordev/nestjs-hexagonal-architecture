/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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

  const mockOtherUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174001',
    'other@example.com',
    'Other User',
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
        UpdateUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    repository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should update user successfully', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = new User(
        userId,
        mockUser.email,
        updateDto.name!,
        mockUser.password,
        mockUser.isActive,
        mockUser.createdAt,
        new Date(),
      );

      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(updatedUser);

      const result = await useCase.execute(userId, updateDto);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.update).toHaveBeenCalledWith(userId, updateDto);
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(userId, updateDto)).rejects.toThrow(
        `User with id ${userId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email is already in use by another user', async () => {
      const updateDto: UpdateUserDto = {
        email: 'other@example.com',
      };

      repository.findById.mockResolvedValue(mockUser);
      repository.findByEmail.mockResolvedValue(mockOtherUser);

      await expect(useCase.execute(userId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(userId, updateDto)).rejects.toThrow(
        `Email ${updateDto.email} is already in use`,
      );

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.findByEmail).toHaveBeenCalledWith(updateDto.email);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should allow updating email to the same email', async () => {
      const updateDto: UpdateUserDto = {
        email: mockUser.email,
        name: 'Updated Name',
      };

      const updatedUser = new User(
        userId,
        mockUser.email,
        updateDto.name!,
        mockUser.password,
        mockUser.isActive,
        mockUser.createdAt,
        new Date(),
      );

      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(updatedUser);

      const result = await useCase.execute(userId, updateDto);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(repository.update).toHaveBeenCalledWith(userId, updateDto);
      expect(repository.findByEmail).not.toHaveBeenCalled();
      expect(result.email).toBe(mockUser.email);
    });
  });
});
