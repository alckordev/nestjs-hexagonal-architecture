import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import {
  type IRefreshTokenRepository,
  type CreateRefreshTokenData,
} from '@auth/domain/ports/refresh-token.repository.port';
import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';

@Injectable()
export class PrismaRefreshTokenRepositoryAdapter implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });

    return RefreshToken.fromPrisma({
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      return null;
    }

    return RefreshToken.fromPrisma({
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    return refreshTokens.map((token) =>
      RefreshToken.fromPrisma({
        id: token.id,
        userId: token.userId,
        token: token.token,
        expiresAt: token.expiresAt,
        createdAt: token.createdAt,
      }),
    );
  }

  async delete(token: string): Promise<void> {
    // Use deleteMany instead of delete to avoid error if token doesn't exist
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
