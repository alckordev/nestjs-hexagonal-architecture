import {
  Injectable,
  ConflictException,
  Inject,
  Optional,
} from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import { CreateUserDto } from '@users/application/dto/create-user.dto';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly repository: IUserRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    createUserDto: CreateUserDto,
    auditContext?: {
      userId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<User> {
    // Check if email already exists
    const existingUser = await this.repository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const user = await this.repository.create(createUserDto);

    // Create audit log (fire and forget - don't block the operation)
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'User',
          entityId: user.id,
          action: 'CREATE',
          userId: auditContext?.userId || null,
          changes: { email: createUserDto.email, name: createUserDto.name },
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        })
        .catch((error) => {
          // Log error but don't fail the main operation
          console.error('Failed to create audit log:', error);
        });
    }

    return user;
  }
}
