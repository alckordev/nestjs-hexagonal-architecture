import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetAuditLogUseCase } from '@audit/application/use-cases/get-audit-log.use-case';
import { GetAuditLogsByEntityUseCase } from '@audit/application/use-cases/get-audit-logs-by-entity.use-case';
import { GetAuditLogsByUserUseCase } from '@audit/application/use-cases/get-audit-logs-by-user.use-case';
import { GetAuditLogsByActionUseCase } from '@audit/application/use-cases/get-audit-logs-by-action.use-case';
import { AuditLogResponseDto } from '@audit/application/dto/audit-log-response.dto';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(
    private readonly getAuditLogUseCase: GetAuditLogUseCase,
    private readonly getAuditLogsByEntityUseCase: GetAuditLogsByEntityUseCase,
    private readonly getAuditLogsByUserUseCase: GetAuditLogsByUserUseCase,
    private readonly getAuditLogsByActionUseCase: GetAuditLogsByActionUseCase,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuditLogResponseDto> {
    const auditLog = await this.getAuditLogUseCase.execute(id);
    return this.mapToResponseDto(auditLog);
  }

  @Get('entity/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.getAuditLogsByEntityUseCase.execute(
      entityType,
      entityId,
    );
    return auditLogs.map((auditLog) => this.mapToResponseDto(auditLog));
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.getAuditLogsByUserUseCase.execute(userId);
    return auditLogs.map((auditLog) => this.mapToResponseDto(auditLog));
  }

  @Get('action/:action')
  async findByAction(
    @Param('action') action: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLogResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const auditLogs = await this.getAuditLogsByActionUseCase.execute(
      action,
      limitNum,
    );
    return auditLogs.map((auditLog) => this.mapToResponseDto(auditLog));
  }

  private mapToResponseDto(auditLog: AuditLog): AuditLogResponseDto {
    return {
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      userId: auditLog.userId,
      changes: auditLog.changes,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
    };
  }
}
