import { Injectable, Inject } from '@nestjs/common';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { CreateInvoiceDto } from '@invoices/application/dto/create-invoice.dto';

@Injectable()
export class CreateInvoiceUseCase {
  constructor(
    @Inject(INVOICE_REPOSITORY_TOKEN)
    private readonly repository: IInvoiceRepository,
  ) {}

  async execute(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return await this.repository.create({
      userId: createInvoiceDto.userId,
      amount: createInvoiceDto.amount,
      description: createInvoiceDto.description,
      status: createInvoiceDto.status || 'pending',
    });
  }
}
