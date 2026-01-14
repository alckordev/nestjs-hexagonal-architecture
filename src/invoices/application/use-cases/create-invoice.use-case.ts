import { Injectable, Inject, Optional } from '@nestjs/common';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';
import { CreateInvoiceDto } from '@invoices/application/dto/create-invoice.dto';
import { AuditService } from '@audit/application/services/audit.service';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  async execute(
    createInvoiceDto: CreateInvoiceDto,
    auditContext?: {
      userId?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
  ): Promise<Invoice> {
    const invoice = await this.repository.create({
      userId: createInvoiceDto.userId,
      amount: createInvoiceDto.amount,
      description: createInvoiceDto.description,
      status: createInvoiceDto.status || InvoiceStatus.PENDING,
    });

    // Create audit log (fire and forget - don't block the operation)
    if (this.auditService) {
      this.auditService
        .log({
          entityType: 'Invoice',
          entityId: invoice.id,
          action: 'CREATE',
          userId: auditContext?.userId || null,
          changes: {
            userId: createInvoiceDto.userId,
            amount: createInvoiceDto.amount,
            status: invoice.status,
          },
          ipAddress: auditContext?.ipAddress || null,
          userAgent: auditContext?.userAgent || null,
        })
        .catch((error) => {
          // Log error but don't fail the main operation
          console.error('Failed to create audit log:', error);
        });
    }

    return invoice;
  }
}
