import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma/prisma.module';
import { UsersModule } from '@users/users.module';
import { InvoicesModule } from '@invoices/invoices.module';
import { getEnvFilePaths } from '@config/env-file-path.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true, // Expands variables like ${VAR_NAME} automatically
      envFilePath: getEnvFilePaths(),
    }),
    PrismaModule,
    UsersModule,
    InvoicesModule,
  ],
  providers: [],
})
export class AppModule {}
