import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({
    example: 'User',
    description: 'Type of entity that was audited',
  })
  entityType: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID of the entity that was audited',
  })
  entityId: string;

  @ApiProperty({
    example: 'CREATE',
    description: 'Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)',
  })
  action: string;

  @ApiProperty({
    example: 'uuid',
    nullable: true,
    description: 'User ID who performed the action',
  })
  userId: string | null;

  @ApiProperty({
    example: { email: 'user@example.com', name: 'John Doe' },
    nullable: true,
    description: 'Changes made to the entity',
  })
  changes: Record<string, unknown> | null;

  @ApiProperty({
    example: { source: 'web', version: '1.0' },
    nullable: true,
    description: 'Additional metadata',
  })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: '192.168.1.1',
    nullable: true,
    description: 'IP address of the client',
  })
  ipAddress: string | null;

  @ApiProperty({
    example: 'Mozilla/5.0...',
    nullable: true,
    description: 'User agent of the client',
  })
  userAgent: string | null;
}
