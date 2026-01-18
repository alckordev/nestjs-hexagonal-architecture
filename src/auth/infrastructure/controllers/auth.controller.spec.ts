/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@auth/application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '@auth/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@auth/application/use-cases/logout.use-case';
import { LoginDto } from '@auth/application/dto/login.dto';
import { RegisterDto } from '@auth/application/dto/register.dto';
import { RefreshTokenDto } from '@auth/application/dto/refresh-token.dto';
import { User } from '@users/domain/entities/user.entity';
import type { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;

  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'Test User',
    'hashedPassword',
    true,
    null,
    mockDate,
    mockUpdatedDate,
  );

  const mockAuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RegisterUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RefreshTokenUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LogoutUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    registerUseCase = module.get(RegisterUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and return AuthResponseDto', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
        socket: { remoteAddress: '192.168.1.1' },
        ip: '192.168.1.1',
      } as unknown as Request;

      registerUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto, mockRequest);

      expect(registerUseCase.execute).toHaveBeenCalledWith(
        registerDto,
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle missing IP address and user agent', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockRequest = {
        headers: {},
        socket: {},
      } as unknown as Request;

      registerUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto, mockRequest);

      expect(registerUseCase.execute).toHaveBeenCalledWith(
        registerDto,
        expect.objectContaining({
          ipAddress: null,
          userAgent: null,
        }),
      );
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should login a user and return AuthResponseDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
        socket: { remoteAddress: '192.168.1.1' },
        ip: '192.168.1.1',
      } as unknown as Request;

      loginUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(loginUseCase.execute).toHaveBeenCalledWith(
        loginDto,
        expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      );
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and return AuthResponseDto', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      refreshTokenUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should logout and revoke tokens', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer access-token',
        },
        body: {
          refreshToken: 'refresh-token',
        },
      } as unknown as Request;

      logoutUseCase.execute.mockResolvedValue();

      await controller.logout(mockRequest);

      expect(logoutUseCase.execute).toHaveBeenCalledWith(
        'access-token',
        'refresh-token',
      );
    });

    it('should handle missing authorization header', async () => {
      const mockRequest = {
        headers: {},
        body: {
          refreshToken: 'refresh-token',
        },
      } as unknown as Request;

      logoutUseCase.execute.mockResolvedValue();

      await controller.logout(mockRequest);

      expect(logoutUseCase.execute).toHaveBeenCalledWith('', 'refresh-token');
    });

    it('should handle missing refresh token in body', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer access-token',
        },
        body: {},
      } as unknown as Request;

      logoutUseCase.execute.mockResolvedValue();

      await controller.logout(mockRequest);

      expect(logoutUseCase.execute).toHaveBeenCalledWith('access-token', '');
    });
  });
});
