import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request as Req,
} from '@nestjs/common';
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@auth/application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '@auth/application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@auth/application/use-cases/logout.use-case';
import { LoginDto } from '@auth/application/dto/login.dto';
import { RegisterDto } from '@auth/application/dto/register.dto';
import { RefreshTokenDto } from '@auth/application/dto/refresh-token.dto';
import { AuthResponseDto } from '@auth/application/dto/auth-response.dto';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { Public } from '@auth/infrastructure/decorators/public.decorator';
import type { Request } from 'express';

// interface AuthenticatedRequest extends Request {
//   user: {
//     id: string;
//     email: string;
//     name: string;
//     isActive: boolean;
//   };
// }

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  private getAuditContext(req: Request): {
    ipAddress: string | null;
    userAgent: string | null;
  } {
    const forwarded = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : (req.socket?.remoteAddress as string) || req.ip || null;
    const userAgent = (req.headers['user-agent'] as string) || null;

    return { ipAddress, userAgent };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(registerDto, this.getAuditContext(req));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(loginDto, this.getAuditContext(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.replace('Bearer ', '') || '';

    // Get refresh token from body (could also be from cookies/header)
    const refreshToken =
      (req.body as { refreshToken?: string })?.refreshToken || '';

    await this.logoutUseCase.execute(accessToken, refreshToken);
  }
}
