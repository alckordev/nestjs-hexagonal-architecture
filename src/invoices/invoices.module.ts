import { Module } from '@nestjs/common';
import { InvoicesController } from './infrastructure/controllers/invoices.controller';
import { CreateInvoiceUseCase } from './application/use-cases/create-invoice.use-case';
import { GetInvoiceUseCase } from './application/use-cases/get-invoice.use-case';
import { GetAllInvoicesUseCase } from './application/use-cases/get-all-invoices.use-case';
import { GetInvoicesByUserUseCase } from './application/use-cases/get-invoices-by-user.use-case';
import { UpdateInvoiceUseCase } from './application/use-cases/update-invoice.use-case';
import { DeleteInvoiceUseCase } from './application/use-cases/delete-invoice.use-case';
import { PrismaInvoiceRepositoryAdapter } from './infrastructure/adapters/prisma-invoice.repository.adapter';
import { INVOICE_REPOSITORY_TOKEN } from './domain/ports/invoice.repository.token';

@Module({
  controllers: [InvoicesController],
  providers: [
    // Use cases
    CreateInvoiceUseCase,
    GetInvoiceUseCase,
    GetAllInvoicesUseCase,
    GetInvoicesByUserUseCase,
    UpdateInvoiceUseCase,
    DeleteInvoiceUseCase,
    // Repository (port implementation)
    {
      provide: INVOICE_REPOSITORY_TOKEN,
      useClass: PrismaInvoiceRepositoryAdapter,
    },
    // Also provide the adapter directly for injection
    PrismaInvoiceRepositoryAdapter,
  ],
  exports: [
    CreateInvoiceUseCase,
    GetInvoiceUseCase,
    GetAllInvoicesUseCase,
    GetInvoicesByUserUseCase,
  ],
})
export class InvoicesModule {}
