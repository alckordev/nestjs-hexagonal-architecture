import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';

@Injectable()
export class GetInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
  ) {}

  async execute(id: string): Promise<Invoice> {
    const invoice = await this.repository.findById(id);

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return invoice;
  }
}
