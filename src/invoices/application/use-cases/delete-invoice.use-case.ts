import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';

@Injectable()
export class DeleteInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Check if invoice exists
    const existingInvoice = await this.repository.findById(id);

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    await this.repository.delete(id);
  }
}
