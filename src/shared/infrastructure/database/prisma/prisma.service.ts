import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.get<string>('DATABASE_URL'),
    });

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    this.logger.log(config.get<string>('DATABASE_URL'));

    if (config.get<string>('NODE_ENV') === 'development') {
      this.$on('query' as never, (e: Prisma.QueryEvent) => {
        if (config.get<string>('NODE_ENV') === 'development') {
          this.logger.debug(`Query: ${e.query}`);
          this.logger.debug(`Params: ${e.params}`);
          this.logger.debug(`Duration: ${e.duration}ms`);
        }
      });
    }

    this.$on('error' as never, (e: Prisma.LogEvent) => {
      this.logger.error(`Error: ${e.message}`);
    });

    this.$on('warn' as never, (e: Prisma.LogEvent) => {
      this.logger.warn(`Warning: ${e.message}`);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('❌ Database disconnected');
  }

  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
