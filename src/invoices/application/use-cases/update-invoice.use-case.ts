import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { UpdateInvoiceDto } from '@invoices/application/dto/update-invoice.dto';

@Injectable()
export class UpdateInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
  ) {}

  async execute(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    // Check if invoice exists
    const existingInvoice = await this.repository.findById(id);

    if (!existingInvoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return await this.repository.update(id, updateInvoiceDto);
  }
}
