import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GetAuditLogUseCase } from '@audit/application/use-cases/get-audit-log.use-case';
import { GetAuditLogsByEntityUseCase } from '@audit/application/use-cases/get-audit-logs-by-entity.use-case';
import { GetAuditLogsByUserUseCase } from '@audit/application/use-cases/get-audit-logs-by-user.use-case';
import { GetAuditLogsByActionUseCase } from '@audit/application/use-cases/get-audit-logs-by-action.use-case';
import { AuditLogResponseDto } from '@audit/application/dto/audit-log-response.dto';
import { AuditLog } from '@audit/domain/entities/audit-log.entity';

@ApiTags('audit')
@ApiBearerAuth('JWT-auth')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(
    private readonly getAuditLogUseCase: GetAuditLogUseCase,
    private readonly getAuditLogsByEntityUseCase: GetAuditLogsByEntityUseCase,
    private readonly getAuditLogsByUserUseCase: GetAuditLogsByUserUseCase,
    private readonly getAuditLogsByActionUseCase: GetAuditLogsByActionUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Audit log found',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(@Param('id') id: string): Promise<AuditLogResponseDto> {
    const auditLog = await this.getAuditLogUseCase.execute(id);
    return this.mapToResponseDto(auditLog);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit logs by entity type and ID' })
  @ApiParam({
    name: 'entityType',
    description: 'Entity type (e.g., User, Invoice)',
    type: String,
  })
  @ApiParam({ name: 'entityId', description: 'Entity ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of audit logs for the entity',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'List of audit logs for the user',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.getAuditLogsByUserUseCase.execute(userId);
    return auditLogs.map((auditLog) => this.mapToResponseDto(auditLog));
  }

  @Get('action/:action')
  @ApiOperation({ summary: 'Get audit logs by action type' })
  @ApiParam({
    name: 'action',
    description: 'Action type (e.g., CREATE, UPDATE, DELETE, LOGIN)',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of results',
  })
  @ApiResponse({
    status: 200,
    description: 'List of audit logs for the action',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findByAction(
    @Param('action') action: string,
    @Query('limit') limit?: string,
  ): Promise<AuditLogResponseDto[]> {
    const limitNum = limit ? Number.parseInt(limit, 10) : undefined;
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
