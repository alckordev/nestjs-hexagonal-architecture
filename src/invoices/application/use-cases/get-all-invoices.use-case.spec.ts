/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetAllInvoicesUseCase } from './get-all-invoices.use-case';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

describe('GetAllInvoicesUseCase', () => {
  let useCase: GetAllInvoicesUseCase;
  let repository: jest.Mocked<IInvoiceRepository>;

  const mockInvoices: Invoice[] = [
    new Invoice(
      'invoice-1',
      'user-1',
      100.5,
      'Invoice 1',
      InvoiceStatus.PENDING,
      new Date(),
      new Date(),
    ),
    new Invoice(
      'invoice-2',
      'user-2',
      200.75,
      'Invoice 2',
      InvoiceStatus.PAID,
      new Date(),
      new Date(),
    ),
  ];

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
        GetAllInvoicesUseCase,
        {
          provide: INVOICE_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllInvoicesUseCase>(GetAllInvoicesUseCase);
    repository = module.get(INVOICE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all invoices', async () => {
      repository.findAll.mockResolvedValue(mockInvoices);

      const result = await useCase.execute();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockInvoices);
      expect(result.length).toBe(2);
    });

    it('should return empty array if no invoices exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
