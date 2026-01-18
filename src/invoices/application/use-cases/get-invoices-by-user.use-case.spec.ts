/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetInvoicesByUserUseCase } from './get-invoices-by-user.use-case';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

describe('GetInvoicesByUserUseCase', () => {
  let useCase: GetInvoicesByUserUseCase;
  let repository: jest.Mocked<IInvoiceRepository>;

  const userId = 'user-id';
  const mockInvoices: Invoice[] = [
    new Invoice(
      'invoice-1',
      userId,
      100.5,
      'Invoice 1',
      InvoiceStatus.PENDING,
      new Date(),
      new Date(),
    ),
    new Invoice(
      'invoice-2',
      userId,
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
        GetInvoicesByUserUseCase,
        {
          provide: INVOICE_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetInvoicesByUserUseCase>(GetInvoicesByUserUseCase);
    repository = module.get(INVOICE_REPOSITORY_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return invoices for a specific user', async () => {
      repository.findByUserId.mockResolvedValue(mockInvoices);

      const result = await useCase.execute(userId);

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockInvoices);
      expect(result.length).toBe(2);
      expect(result.every((invoice) => invoice.userId === userId)).toBe(true);
    });

    it('should return empty array if user has no invoices', async () => {
      repository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(userId);

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
