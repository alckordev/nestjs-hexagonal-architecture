import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/database/prisma/prisma.module';
import { UsersModule } from './users/users.module';

/**
 * Dynamically builds the list of environment file paths based on NODE_ENV
 * Priority order:
 * 1. .env.{NODE_ENV} (specific environment file)
 * 2. .env.development (fallback for non-production)
 * 3. .env (base fallback)
 */
function getEnvFilePaths(): string[] {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envPaths: string[] = [];

  // Add environment-specific file
  if (nodeEnv) {
    envPaths.push(`.env.${nodeEnv}`);
  }

  // Add development fallback (unless already added)
  if (nodeEnv !== 'development') {
    envPaths.push('.env.development');
  }

  // Always add base .env as final fallback
  envPaths.push('.env');

  return envPaths;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths(),
    }),
    PrismaModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
