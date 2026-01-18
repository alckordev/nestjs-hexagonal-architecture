import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UpdateUserData,
} from '../../domain/ports/user.repository.port';

// Mock PrismaService before importing the adapter
jest.mock(
  '../../../shared/infrastructure/database/prisma/prisma.service',
  () => {
    return {
      PrismaService: jest.fn().mockImplementation(() => ({
        user: {
          create: jest.fn(),
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })),
    };
  },
);

import { PrismaUserRepositoryAdapter } from './prisma-user.repository.adapter';
import { PrismaService } from '../../../shared/infrastructure/database/prisma/prisma.service';

describe('PrismaUserRepositoryAdapter', () => {
  let adapter: PrismaUserRepositoryAdapter;
  let prismaService: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  const mockPrismaUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    isActive: true,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockUpdatedDate,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepositoryAdapter,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    adapter = module.get<PrismaUserRepositoryAdapter>(
      PrismaUserRepositoryAdapter,
    );
    prismaService = mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return User entity', async () => {
      const createData: CreateUserData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      prismaService.user.create.mockResolvedValue(mockPrismaUser as any);

      const result = await adapter.create(createData);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(createData.email);
      expect(result.name).toBe(createData.name);
    });
  });

  describe('findById', () => {
    it('should return a User when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockPrismaUser as any);

      const result = await adapter.findById(mockPrismaUser.id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPrismaUser.id },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockPrismaUser.id);
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a User when found by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockPrismaUser as any);

      const result = await adapter.findByEmail(mockPrismaUser.email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockPrismaUser.email },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockPrismaUser.email);
    });

    it('should return null when user not found by email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await adapter.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of Users', async () => {
      const mockUsers = [
        mockPrismaUser,
        { ...mockPrismaUser, id: 'another-id' },
      ];
      prismaService.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await adapter.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should return empty array when no non-deleted users exist', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update user and return updated User entity', async () => {
      const updateData: UpdateUserData = {
        name: 'Updated Name',
      };

      const updatedPrismaUser = {
        ...mockPrismaUser,
        name: updateData.name,
      };

      prismaService.user.update.mockResolvedValue(updatedPrismaUser as any);

      const result = await adapter.update(mockPrismaUser.id, updateData);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockPrismaUser.id },
        data: updateData,
      });
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(updateData.name);
    });

    it('should only update provided fields', async () => {
      const updateData: UpdateUserData = {
        isActive: false,
      };

      const updatedPrismaUser = {
        ...mockPrismaUser,
        isActive: false,
      };

      prismaService.user.update.mockResolvedValue(updatedPrismaUser as any);

      const result = await adapter.update(mockPrismaUser.id, updateData);

      expect(result.isActive).toBe(false);
      expect(result.email).toBe(mockPrismaUser.email);
    });
  });

  describe('delete', () => {
    it('should soft delete a user by setting deletedAt timestamp', async () => {
      const deletedAt = new Date();
      const updatedUser = { ...mockPrismaUser, deletedAt };
      prismaService.user.update.mockResolvedValue(updatedUser as any);

      await adapter.delete(mockPrismaUser.id);

      // Soft delete: sets deletedAt to current timestamp instead of physical deletion
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockPrismaUser.id },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });
  });
});
