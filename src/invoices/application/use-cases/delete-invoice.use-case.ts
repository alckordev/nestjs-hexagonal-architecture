import {
  Injectable,
  NotFoundException,
  Inject,
  Optional,
  Logger,
} from '@nestjs/common';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class DeleteInvoiceUseCase {
  private readonly logger = new Logger(DeleteInvoiceUseCase.name);

  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
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
    // Check if invoice exists and is not deleted
    const existingInvoice = await this.repository.findById(id);

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    // Soft delete: set deletedAt to current timestamp
    await this.repository.delete(id);

    // Create audit log (fire and forget - don't block the operation)
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'Invoice',
          entityId: id,
          action: 'DELETE',
          userId: auditContext?.userId || null,
          changes: null,
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        })
        .catch((error) => {
          // Log error but don't fail the main operation
          this.logger.error('Failed to create audit log', error);
        });
    }
  }
}
