import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import {
  type ITokenBlacklistRepository,
  type CreateTokenBlacklistData,
} from '@auth/domain/ports/token-blacklist.repository.port';

@Injectable()
export class PrismaTokenBlacklistRepositoryAdapter implements ITokenBlacklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(data: CreateTokenBlacklistData): Promise<void> {
    await this.prisma.tokenBlacklist.upsert({
      where: { token: data.token },
      create: {
        token: data.token,
        expiresAt: data.expiresAt,
      },
      update: {
        expiresAt: data.expiresAt,
      },
    });
  }

  async exists(token: string): Promise<boolean> {
    const blacklisted = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    if (!blacklisted) {
      return false;
    }

    // Check if expired and delete if so
    if (blacklisted.expiresAt < new Date()) {
      await this.prisma.tokenBlacklist.delete({
        where: { token },
      });
      return false;
    }

    return true;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
