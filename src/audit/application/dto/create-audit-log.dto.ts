import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateAuditLogDto {
  @IsString({ message: 'entityType must be a string' })
  @IsNotEmpty({ message: 'entityType is required' })
  @MaxLength(50, { message: 'entityType must not exceed 50 characters' })
  entityType: string;

  @IsString({ message: 'entityId must be a string' })
  @IsNotEmpty({ message: 'entityId is required' })
  entityId: string;

  @IsString({ message: 'action must be a string' })
  @IsNotEmpty({ message: 'action is required' })
  @MaxLength(50, { message: 'action must not exceed 50 characters' })
  action: string;

  @IsOptional()
  @IsString({ message: 'userId must be a string' })
  userId?: string | null;

  @IsOptional()
  @IsObject({ message: 'changes must be an object' })
  changes?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject({ message: 'metadata must be an object' })
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString({ message: 'ipAddress must be a string' })
  ipAddress?: string | null;

  @IsOptional()
  @IsString({ message: 'userAgent must be a string' })
  userAgent?: string | null;
}
