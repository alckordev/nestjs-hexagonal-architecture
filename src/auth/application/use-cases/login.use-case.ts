import {
  Injectable,
  UnauthorizedException,
  Inject,
  Optional,
  Logger,
} from '@nestjs/common';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import type { IRefreshTokenRepository } from '@auth/domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@auth/domain/ports/refresh-token.repository.token';
import { PasswordService } from '@auth/infrastructure/services/password.service';
import { AuthJwtService } from '@auth/infrastructure/services/jwt.service';
import { LoginDto } from '@auth/application/dto/login.dto';
import { AuthResponseDto } from '@auth/application/dto/auth-response.dto';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: AuthJwtService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    loginDto: LoginDto,
    auditContext?: {
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await this.passwordService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Delete old refresh tokens for this user
    await this.refreshTokenRepository.deleteByUserId(user.id);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } =
      this.jwtService.generateTokenPair(payload);

    // Store refresh token
    const expiresAt = this.jwtService.getRefreshTokenExpiration();
    await this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // Create audit log
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'User',
          entityId: user.id,
          action: 'LOGIN',
          userId: user.id,
          changes: null,
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        })
        .catch((error) => {
          this.logger.error('Failed to create audit log', error);
        });
    }

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
