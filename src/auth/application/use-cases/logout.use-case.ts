import { Injectable, Inject } from '@nestjs/common';
import type { IRefreshTokenRepository } from '@auth/domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@auth/domain/ports/refresh-token.repository.token';
import type { ITokenBlacklistRepository } from '@auth/domain/ports/token-blacklist.repository.port';
import { TOKEN_BLACKLIST_REPOSITORY_TOKEN } from '@auth/domain/ports/token-blacklist.repository.token';
import { AuthJwtService } from '@auth/infrastructure/services/jwt.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(TOKEN_BLACKLIST_REPOSITORY_TOKEN)
    private readonly tokenBlacklistRepository: ITokenBlacklistRepository,
    private readonly jwtService: AuthJwtService,
  ) {}

  async execute(
    accessToken: string,
    refreshToken: string,
    // userId: string,
  ): Promise<void> {
    // Delete refresh token
    await this.refreshTokenRepository.delete(refreshToken);

    // Add access token to blacklist
    const expiresAt = this.jwtService.getAccessTokenExpiration();
    await this.tokenBlacklistRepository.add({
      token: accessToken,
      expiresAt,
    });
  }
}
