/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import type { IRefreshTokenRepository } from '@auth/domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@auth/domain/ports/refresh-token.repository.token';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import {
  AuthJwtService,
  type JwtPayload,
} from '@auth/infrastructure/services/jwt.service';
import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';
import { User } from '@users/domain/entities/user.entity';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<AuthJwtService>;

  const refreshTokenDto: RefreshTokenDto = {
    refreshToken: 'valid-refresh-token',
  };

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'Test User',
    'hashedPassword',
    true,
    new Date(),
    new Date(),
  );

  const mockJwtPayload: JwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
  };

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const mockStoredToken = new RefreshToken(
    'token-id',
    mockUser.id,
    refreshTokenDto.refreshToken,
    futureDate,
    new Date(),
  );

  beforeEach(async () => {
    const mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository> = {
      create: jest.fn(),
      findByToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const mockUserRepository: jest.Mocked<IUserRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
        RefreshTokenUseCase,
        {
          provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: AuthJwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY_TOKEN);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    jwtService = module.get(AuthJwtService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('execute', () => {
    it('should refresh tokens successfully', async () => {
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      jwtService.verifyRefreshToken.mockReturnValue(mockJwtPayload);
      refreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken);
      refreshTokenRepository.delete.mockResolvedValue();
      userRepository.findById.mockResolvedValue(mockUser);
      jwtService.generateTokenPair.mockReturnValue({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
      jwtService.getRefreshTokenExpiration.mockReturnValue(expiresAt);
      refreshTokenRepository.create.mockResolvedValue(
        new RefreshToken(
          'id',
          mockUser.id,
          newRefreshToken,
          expiresAt,
          new Date(),
        ),
      );

      const result = await useCase.execute(refreshTokenDto);

      expect(jwtService.verifyRefreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(newRefreshToken);
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      jwtService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(refreshTokenRepository.findByToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if refresh token not found in database', async () => {
      jwtService.verifyRefreshToken.mockReturnValue(mockJwtPayload);
      refreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        'Refresh token not found',
      );

      expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      const expiredToken = new RefreshToken(
        'token-id',
        mockUser.id,
        refreshTokenDto.refreshToken,
        expiredDate,
        new Date(),
      );

      jwtService.verifyRefreshToken.mockReturnValue(mockJwtPayload);
      refreshTokenRepository.findByToken.mockResolvedValue(expiredToken);
      refreshTokenRepository.delete.mockResolvedValue();

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        'Refresh token has expired',
      );

      expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jwtService.verifyRefreshToken.mockReturnValue(mockJwtPayload);
      refreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken);
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        'User not found',
      );

      // delete is NOT called when user doesn't exist
      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
      expect(userRepository.findById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = new User(
        mockUser.id,
        mockUser.email,
        mockUser.name,
        mockUser.password,
        false,
        mockUser.createdAt,
        mockUser.updatedAt,
      );

      jwtService.verifyRefreshToken.mockReturnValue(mockJwtPayload);
      refreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken);
      userRepository.findById.mockResolvedValue(inactiveUser);

      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(useCase.execute(refreshTokenDto)).rejects.toThrow(
        'User account is inactive',
      );

      // delete is NOT called when user is inactive
      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
      expect(userRepository.findById).toHaveBeenCalledWith(mockJwtPayload.sub);
    });
  });
});
