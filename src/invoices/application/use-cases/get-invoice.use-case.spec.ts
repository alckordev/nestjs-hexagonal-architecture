/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetInvoiceUseCase } from './get-invoice.use-case';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

describe('GetInvoiceUseCase', () => {
  let useCase: GetInvoiceUseCase;
  let repository: jest.Mocked<IInvoiceRepository>;

  const mockInvoice: Invoice = new Invoice(
    'invoice-id',
    'user-id',
    100.5,
    'Test invoice',
    InvoiceStatus.PENDING,
    null, // deletedAt
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IInvoiceRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetInvoiceUseCase,
        {
          provide: INVOICE_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetInvoiceUseCase>(GetInvoiceUseCase);
    repository = module.get(INVOICE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return an invoice by id', async () => {
      repository.findById.mockResolvedValue(mockInvoice);

      const result = await useCase.execute(mockInvoice.id);

      expect(repository.findById).toHaveBeenCalledWith(mockInvoice.id);
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if invoice does not exist', async () => {
      const invoiceId = 'non-existent-id';
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(invoiceId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(invoiceId)).rejects.toThrow(
        `Invoice with id ${invoiceId} not found`,
      );

      expect(repository.findById).toHaveBeenCalledWith(invoiceId);
    });
  });
});
