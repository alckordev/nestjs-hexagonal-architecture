import { Module, Global } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { PrismaRefreshTokenRepositoryAdapter } from './infrastructure/adapters/prisma-refresh-token.repository.adapter';
import { PrismaTokenBlacklistRepositoryAdapter } from './infrastructure/adapters/prisma-token-blacklist.repository.adapter';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from './domain/ports/refresh-token.repository.token';
import { TOKEN_BLACKLIST_REPOSITORY_TOKEN } from './domain/ports/token-blacklist.repository.token';
import { PasswordService } from './infrastructure/services/password.service';
import { AuthJwtService } from './infrastructure/services/jwt.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { UsersModule } from '@users/users.module';
import { AuditModule } from '@audit/audit.module';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_ACCESS_TOKEN_SECRET');
        const expiresIn = config.get<JwtSignOptions['expiresIn']>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
          '15m',
        );

        if (!secret) {
          throw new Error('JWT_ACCESS_TOKEN_SECRET is not configured');
        }

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    // Use cases
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    // Services
    PasswordService,
    AuthJwtService,
    // Strategies
    JwtStrategy,
    // Guards
    JwtAuthGuard,
    // Repository adapters
    {
      provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
      useClass: PrismaRefreshTokenRepositoryAdapter,
    },
    {
      provide: TOKEN_BLACKLIST_REPOSITORY_TOKEN,
      useClass: PrismaTokenBlacklistRepositoryAdapter,
    },
    PrismaRefreshTokenRepositoryAdapter,
    PrismaTokenBlacklistRepositoryAdapter,
  ],
  exports: [JwtAuthGuard, AuthJwtService, PasswordService],
})
export class AuthModule {}
