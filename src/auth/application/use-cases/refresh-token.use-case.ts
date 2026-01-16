import {
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { IRefreshTokenRepository } from '@auth/domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@auth/domain/ports/refresh-token.repository.token';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import {
  AuthJwtService,
  JwtPayload,
} from '@auth/infrastructure/services/jwt.service';
import { RefreshTokenDto } from '@auth/application/dto/refresh-token.dto';
import { AuthResponseDto } from '@auth/application/dto/auth-response.dto';

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: AuthJwtService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    // Verify refresh token
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verifyRefreshToken(
        refreshTokenDto.refreshToken,
      );
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const storedToken = await this.refreshTokenRepository.findByToken(
      refreshTokenDto.refreshToken,
    );

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (storedToken.isExpired()) {
      // Delete expired token
      await this.refreshTokenRepository.delete(storedToken.token);
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Verify user exists and is active
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Delete old refresh token
    await this.refreshTokenRepository.delete(storedToken.token);

    // Generate new token pair
    const newPayload = {
      sub: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } =
      this.jwtService.generateTokenPair(newPayload);

    // Store new refresh token
    const expiresAt = this.jwtService.getRefreshTokenExpiration();
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
    };
  }
}
