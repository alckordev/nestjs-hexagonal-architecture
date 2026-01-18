import { Test, TestingModule } from '@nestjs/testing';
import { CreateTokenBlacklistData } from '@auth/domain/ports/token-blacklist.repository.port';

// Mock PrismaService before importing the adapter
jest.mock('@database/prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({
      tokenBlacklist: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    })),
  };
});

import { PrismaTokenBlacklistRepositoryAdapter } from './prisma-token-blacklist.repository.adapter';
import { PrismaService } from '@database/prisma/prisma.service';

describe('PrismaTokenBlacklistRepositoryAdapter', () => {
  let adapter: PrismaTokenBlacklistRepositoryAdapter;
  let prismaService: {
    tokenBlacklist: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  const expiresAt = new Date('2024-01-08T00:00:00.000Z');

  const mockPrismaTokenBlacklist = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    token: 'blacklisted-token',
    expiresAt,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      tokenBlacklist: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTokenBlacklistRepositoryAdapter,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    adapter = module.get<PrismaTokenBlacklistRepositoryAdapter>(
      PrismaTokenBlacklistRepositoryAdapter,
    );
    prismaService = mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    it('should upsert a token to blacklist', async () => {
      const createData: CreateTokenBlacklistData = {
        token: 'blacklisted-token',
        expiresAt,
      };

      prismaService.tokenBlacklist.upsert.mockResolvedValue(
        mockPrismaTokenBlacklist as any,
      );

      await adapter.add(createData);

      expect(prismaService.tokenBlacklist.upsert).toHaveBeenCalledWith({
        where: { token: createData.token },
        create: {
          token: createData.token,
          expiresAt: createData.expiresAt,
        },
        update: {
          expiresAt: createData.expiresAt,
        },
      });
    });
  });

  describe('exists', () => {
    it('should return true if token is blacklisted and not expired', async () => {
      const now = new Date('2024-01-05T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prismaService.tokenBlacklist.findUnique.mockResolvedValue(
        mockPrismaTokenBlacklist as any,
      );

      const result = await adapter.exists('blacklisted-token');

      expect(prismaService.tokenBlacklist.findUnique).toHaveBeenCalledWith({
        where: { token: 'blacklisted-token' },
      });
      expect(result).toBe(true);
      expect(prismaService.tokenBlacklist.deleteMany).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should return false if token is not blacklisted', async () => {
      prismaService.tokenBlacklist.findUnique.mockResolvedValue(null);

      const result = await adapter.exists('non-blacklisted-token');

      expect(result).toBe(false);
      expect(prismaService.tokenBlacklist.deleteMany).not.toHaveBeenCalled();
    });

    it('should return false and delete token if token is expired', async () => {
      const expiredToken = {
        ...mockPrismaTokenBlacklist,
        expiresAt: new Date('2024-01-01T00:00:00.000Z'),
      };
      const now = new Date('2024-01-10T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prismaService.tokenBlacklist.findUnique.mockResolvedValue(
        expiredToken as any,
      );
      prismaService.tokenBlacklist.deleteMany.mockResolvedValue({ count: 1 });

      const result = await adapter.exists('expired-token');

      expect(result).toBe(false);
      expect(prismaService.tokenBlacklist.deleteMany).toHaveBeenCalledWith({
        where: { token: 'expired-token' },
      });

      jest.useRealTimers();
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired tokens and return count', async () => {
      const now = new Date('2024-01-10T00:00:00.000Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      prismaService.tokenBlacklist.deleteMany.mockResolvedValue({ count: 3 });

      const result = await adapter.deleteExpired();

      expect(prismaService.tokenBlacklist.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });
      expect(result).toBe(3);

      jest.useRealTimers();
    });
  });
});
