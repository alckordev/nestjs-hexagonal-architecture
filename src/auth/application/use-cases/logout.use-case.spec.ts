/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from './logout.use-case';
import type { IRefreshTokenRepository } from '@auth/domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@auth/domain/ports/refresh-token.repository.token';
import type { ITokenBlacklistRepository } from '@auth/domain/ports/token-blacklist.repository.port';
import { TOKEN_BLACKLIST_REPOSITORY_TOKEN } from '@auth/domain/ports/token-blacklist.repository.token';
import { AuthJwtService } from '@auth/infrastructure/services/jwt.service';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let tokenBlacklistRepository: jest.Mocked<ITokenBlacklistRepository>;
  let jwtService: jest.Mocked<AuthJwtService>;

  const accessToken = 'access-token';
  const refreshToken = 'refresh-token';
  // const userId = 'user-id';

  beforeEach(async () => {
    const mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository> = {
      create: jest.fn(),
      findByToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const mockTokenBlacklistRepository: jest.Mocked<ITokenBlacklistRepository> =
      {
        add: jest.fn(),
        exists: jest.fn(),
        deleteExpired: jest.fn(),
      };

    const mockJwtService: jest.Mocked<AuthJwtService> = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      generateTokenPair: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getAccessTokenExpiration: jest.fn(),
      getRefreshTokenExpiration: jest.fn(),
    } as unknown as jest.Mocked<AuthJwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TOKEN_BLACKLIST_REPOSITORY_TOKEN,
          useValue: mockTokenBlacklistRepository,
        },
        {
          provide: AuthJwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY_TOKEN);
    tokenBlacklistRepository = module.get(TOKEN_BLACKLIST_REPOSITORY_TOKEN);
    jwtService = module.get(AuthJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should logout successfully by deleting refresh token and blacklisting access token', async () => {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      refreshTokenRepository.delete.mockResolvedValue();
      jwtService.getAccessTokenExpiration.mockReturnValue(expiresAt);
      tokenBlacklistRepository.add.mockResolvedValue();

      await useCase.execute(accessToken, refreshToken);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith(refreshToken);
      expect(jwtService.getAccessTokenExpiration).toHaveBeenCalled();
      expect(tokenBlacklistRepository.add).toHaveBeenCalledWith({
        token: accessToken,
        expiresAt,
      });
    });

    it('should complete logout successfully', async () => {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      refreshTokenRepository.delete.mockResolvedValue();
      jwtService.getAccessTokenExpiration.mockReturnValue(expiresAt);
      tokenBlacklistRepository.add.mockResolvedValue();

      await expect(
        useCase.execute(accessToken, refreshToken),
      ).resolves.not.toThrow();

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith(refreshToken);
      expect(tokenBlacklistRepository.add).toHaveBeenCalled();
    });
  });
});
