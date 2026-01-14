import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Optional,
} from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import { UpdateUserDto } from '@users/application/dto/update-user.dto';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly repository: IUserRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    id: string,
    updateUserDto: UpdateUserDto,
    auditContext?: {
      userId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<User> {
    // Check if user exists
    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // If updating email, verify it's not already in use by another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.repository.findByEmail(
        updateUserDto.email,
      );

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(
          `Email ${updateUserDto.email} is already in use`,
        );
      }
    }

    const user = await this.repository.update(id, updateUserDto);

    // Create audit log (fire and forget - don't block the operation)
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'User',
          entityId: user.id,
          action: 'UPDATE',
          userId: auditContext?.userId || null,
          changes: updateUserDto as Record<string, unknown>,
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
