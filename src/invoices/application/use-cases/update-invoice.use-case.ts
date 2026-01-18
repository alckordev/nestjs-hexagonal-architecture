import {
  Injectable,
  NotFoundException,
  Inject,
  Optional,
  Logger,
} from '@nestjs/common';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { UpdateInvoiceDto } from '@invoices/application/dto/update-invoice.dto';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class UpdateInvoiceUseCase {
  private readonly logger = new Logger(UpdateInvoiceUseCase.name);

  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    auditContext?: {
      userId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<Invoice> {
    // Check if invoice exists
    const existingInvoice = await this.repository.findById(id);

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    const invoice = await this.repository.update(id, updateInvoiceDto);

    // Create audit log (fire and forget - don't block the operation)
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'Invoice',
          entityId: invoice.id,
          action: 'UPDATE',
          userId: auditContext?.userId || null,
          changes: updateInvoiceDto as Record<string, unknown>,
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        })
        .catch((error) => {
          // Log error but don't fail the main operation
          this.logger.error('Failed to create audit log', error);
        });
    }

    return invoice;
  }
}
