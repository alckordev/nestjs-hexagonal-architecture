import { Test, TestingModule } from '@nestjs/testing';
import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';
import { CreateRefreshTokenData } from '@auth/domain/ports/refresh-token.repository.port';

// Mock PrismaService before importing the adapter
jest.mock('@database/prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    })),
  };
});

import { PrismaRefreshTokenRepositoryAdapter } from './prisma-refresh-token.repository.adapter';
import { PrismaService } from '@database/prisma/prisma.service';

describe('PrismaRefreshTokenRepositoryAdapter', () => {
  let adapter: PrismaRefreshTokenRepositoryAdapter;
  let prismaService: {
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const expiresAt = new Date('2024-01-08T00:00:00.000Z');

  const mockPrismaRefreshToken = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-id',
    token: 'refresh-token',
    expiresAt,
    createdAt: mockDate,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRefreshTokenRepositoryAdapter,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    adapter = module.get<PrismaRefreshTokenRepositoryAdapter>(
      PrismaRefreshTokenRepositoryAdapter,
    );
    prismaService = mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a refresh token and return RefreshToken entity', async () => {
      const createData: CreateRefreshTokenData = {
        userId: 'user-id',
        token: 'refresh-token',
        expiresAt,
      };

      prismaService.refreshToken.create.mockResolvedValue(
        mockPrismaRefreshToken as any,
      );

      const result = await adapter.create(createData);

      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          userId: createData.userId,
          token: createData.token,
          expiresAt: createData.expiresAt,
        },
      });
      expect(result).toBeInstanceOf(RefreshToken);
      expect(result.userId).toBe(createData.userId);
      expect(result.token).toBe(createData.token);
      expect(result.expiresAt).toEqual(createData.expiresAt);
    });
  });

  describe('findByToken', () => {
    it('should return a RefreshToken when found', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(
        mockPrismaRefreshToken as any,
      );

      const result = await adapter.findByToken('refresh-token');

      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.token).toBe('refresh-token');
    });

    it('should return null when refresh token not found', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      const result = await adapter.findByToken('non-existent-token');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return an array of RefreshTokens for a user', async () => {
      const mockTokens = [
        mockPrismaRefreshToken,
        { ...mockPrismaRefreshToken, id: 'another-id', token: 'token-2' },
      ];
      prismaService.refreshToken.findMany.mockResolvedValue(mockTokens as any);

      const result = await adapter.findByUserId('user-id');

      expect(prismaService.refreshToken.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(RefreshToken);
      expect(result[0].userId).toBe('user-id');
    });

    it('should return empty array when no refresh tokens found for user', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([]);

      const result = await adapter.findByUserId('user-id');

      expect(prismaService.refreshToken.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete refresh token using deleteMany', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await adapter.delete('refresh-token');

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all refresh tokens for a user', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await adapter.deleteByUserId('user-id');

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired refresh tokens and return count', async () => {
      const now = new Date('2024-01-10T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      const result = await adapter.deleteExpired();

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });
      expect(result).toBe(5);

      jest.useRealTimers();
    });
  });
});
