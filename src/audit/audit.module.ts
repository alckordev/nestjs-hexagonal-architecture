import { Module } from '@nestjs/common';
import { AuditLogsController } from './infrastructure/controllers/audit-logs.controller';
import { CreateAuditLogUseCase } from './application/use-cases/create-audit-log.use-case';
import { GetAuditLogUseCase } from './application/use-cases/get-audit-log.use-case';
import { GetAuditLogsByEntityUseCase } from './application/use-cases/get-audit-logs-by-entity.use-case';
import { GetAuditLogsByUserUseCase } from './application/use-cases/get-audit-logs-by-user.use-case';
import { GetAuditLogsByActionUseCase } from './application/use-cases/get-audit-logs-by-action.use-case';
import { DynamoDBAuditLogRepositoryAdapter } from './infrastructure/adapters/dynamodb-audit-log.repository.adapter';
import { AUDIT_LOG_REPOSITORY_TOKEN } from './domain/ports/audit-log.repository.token';

@Module({
  controllers: [AuditLogsController],
  providers: [
    // Use cases
    CreateAuditLogUseCase,
    GetAuditLogUseCase,
    GetAuditLogsByEntityUseCase,
    GetAuditLogsByUserUseCase,
    GetAuditLogsByActionUseCase,
    // Repository (port implementation)
    {
      provide: AUDIT_LOG_REPOSITORY_TOKEN,
      useClass: DynamoDBAuditLogRepositoryAdapter,
    },
    // Also provide the adapter directly for injection
    DynamoDBAuditLogRepositoryAdapter,
  ],
  exports: [
    CreateAuditLogUseCase,
    GetAuditLogUseCase,
    GetAuditLogsByEntityUseCase,
  ],
})
export class AuditModule {}
