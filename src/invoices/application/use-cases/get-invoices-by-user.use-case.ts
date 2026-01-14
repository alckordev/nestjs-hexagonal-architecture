import { Injectable, Inject } from '@nestjs/common';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';

@Injectable()
export class GetInvoicesByUserUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
  ) {}

  async execute(userId: string): Promise<Invoice[]> {
    return await this.repository.findByUserId(userId);
  }
}
