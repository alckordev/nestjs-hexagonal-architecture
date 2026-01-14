import {
  Injectable,
  NotFoundException,
  Inject,
  Optional,
} from '@nestjs/common';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly repository: IUserRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    id: string,
    auditContext?: {
      userId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<void> {
    // Check if user exists
    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.repository.delete(id);

    // Create audit log (fire and forget - don't block the operation)
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'User',
          entityId: id,
          action: 'DELETE',
          userId: auditContext?.userId || null,
          changes: null,
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        })
        .catch((error) => {
          // Log error but don't fail the main operation
          console.error('Failed to create audit log:', error);
        });
    }
  }
}
