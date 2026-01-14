import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/database/prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { getEnvFilePaths } from './shared/infrastructure/config/env-file-path.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true, // Expands variables like ${VAR_NAME} automatically
      envFilePath: getEnvFilePaths(),
    }),
    PrismaModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
