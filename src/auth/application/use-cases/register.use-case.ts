import {
  Injectable,
  ConflictException,
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
import { RegisterDto } from '@auth/application/dto/register.dto';
import { AuthResponseDto } from '@auth/application/dto/auth-response.dto';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

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
    registerDto: RegisterDto,
    auditContext?: {
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<AuthResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException(
        `User with email ${registerDto.email} already exists`,
      );
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(
      registerDto.password,
    );

    // Create user
    const user = await this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    });

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
          action: 'REGISTER',
          userId: user.id,
          changes: { email: registerDto.email, name: registerDto.name },
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
