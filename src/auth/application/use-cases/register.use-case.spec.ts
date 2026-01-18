/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import type { IRefreshTokenRepository } from '@auth/domain/ports/refresh-token.repository.port';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@auth/domain/ports/refresh-token.repository.token';
import { PasswordService } from '@auth/infrastructure/services/password.service';
import { AuthJwtService } from '@auth/infrastructure/services/jwt.service';
import { AuditService } from '@audit/application/services/audit.service';
import { User } from '@users/domain/entities/user.entity';
import { RefreshToken } from '@auth/domain/entities/refresh-token.entity';
import { RegisterDto } from '../dto/register.dto';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let jwtService: jest.Mocked<AuthJwtService>;
  let auditService: jest.Mocked<AuditService>;

  const registerDto: RegisterDto = {
    email: 'newuser@example.com',
    name: 'New User',
    password: 'password123',
  };

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    registerDto.email,
    registerDto.name,
    'hashedPassword',
    true,
    null, // deletedAt
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockRefreshTokenRepository: jest.Mocked<IRefreshTokenRepository> = {
      create: jest.fn(),
      findByToken: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    };

    const mockPasswordService: jest.Mocked<PasswordService> = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    const mockJwtService: jest.Mocked<AuthJwtService> = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      generateTokenPair: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getAccessTokenExpiration: jest.fn(),
      getRefreshTokenExpiration: jest.fn(),
    } as unknown as jest.Mocked<AuthJwtService>;

    const mockAuditService: jest.Mocked<AuditService> = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: AuthJwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    refreshTokenRepository = module.get(REFRESH_TOKEN_REPOSITORY_TOKEN);
    passwordService = module.get(PasswordService);
    jwtService = module.get(AuthJwtService);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      userRepository.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockUser);
      jwtService.generateTokenPair.mockReturnValue({
        accessToken,
        refreshToken,
      });
      jwtService.getRefreshTokenExpiration.mockReturnValue(expiresAt);
      refreshTokenRepository.create.mockResolvedValue(
        new RefreshToken(
          'id',
          mockUser.id,
          refreshToken,
          expiresAt,
          new Date(),
        ),
      );
      auditService.log.mockResolvedValue();

      const result = await useCase.execute(registerDto, {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(passwordService.hash).toHaveBeenCalledWith(registerDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
      });
      expect(jwtService.generateTokenPair).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(refreshTokenRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        token: refreshToken,
        expiresAt,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.refreshToken).toBe(refreshToken);
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(useCase.execute(registerDto)).rejects.toThrow(
        `User with email ${registerDto.email} already exists`,
      );

      expect(passwordService.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should work without audit service', async () => {
      const moduleWithoutAudit: TestingModule = await Test.createTestingModule({
        providers: [
          RegisterUseCase,
          {
            provide: USER_REPOSITORY_TOKEN,
            useValue: userRepository,
          },
          {
            provide: REFRESH_TOKEN_REPOSITORY_TOKEN,
            useValue: refreshTokenRepository,
          },
          {
            provide: PasswordService,
            useValue: passwordService,
          },
          {
            provide: AuthJwtService,
            useValue: jwtService,
          },
        ],
      }).compile();

      const useCaseWithoutAudit =
        moduleWithoutAudit.get<RegisterUseCase>(RegisterUseCase);

      userRepository.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue(mockUser);
      jwtService.generateTokenPair.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      jwtService.getRefreshTokenExpiration.mockReturnValue(new Date());
      refreshTokenRepository.create.mockResolvedValue(
        new RefreshToken('id', mockUser.id, 'token', new Date(), new Date()),
      );

      const result = await useCaseWithoutAudit.execute(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });
  });
});
