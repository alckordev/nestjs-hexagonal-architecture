/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInvoiceUseCase } from './create-invoice.use-case';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { AuditService } from '@audit/application/services/audit.service';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';

describe('CreateInvoiceUseCase', () => {
  let useCase: CreateInvoiceUseCase;
  let repository: jest.Mocked<IInvoiceRepository>;
  let auditService: jest.Mocked<AuditService>;

  const createInvoiceDto: CreateInvoiceDto = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    amount: 100.5,
    description: 'Test invoice',
    status: InvoiceStatus.PENDING,
  };

  const mockInvoice: Invoice = new Invoice(
    'invoice-id',
    createInvoiceDto.userId,
    createInvoiceDto.amount,
    createInvoiceDto.description || null,
    createInvoiceDto.status || InvoiceStatus.PENDING,
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

    const mockAuditService: jest.Mocked<AuditService> = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvoiceUseCase,
        {
          provide: INVOICE_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    useCase = module.get<CreateInvoiceUseCase>(CreateInvoiceUseCase);
    repository = module.get(INVOICE_REPOSITORY_TOKEN);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create an invoice successfully', async () => {
      repository.create.mockResolvedValue(mockInvoice);
      auditService.log.mockResolvedValue();

      const result = await useCase.execute(createInvoiceDto, {
        userId: 'audit-user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(repository.create).toHaveBeenCalledWith({
        userId: createInvoiceDto.userId,
        amount: createInvoiceDto.amount,
        description: createInvoiceDto.description,
        status: createInvoiceDto.status,
      });
      expect(result).toEqual(mockInvoice);
    });

    it('should create invoice with default status PENDING if not provided', async () => {
      const dtoWithoutStatus: CreateInvoiceDto = {
        userId: createInvoiceDto.userId,
        amount: createInvoiceDto.amount,
        description: createInvoiceDto.description,
      };

      const invoiceWithDefaultStatus = new Invoice(
        mockInvoice.id,
        mockInvoice.userId,
        mockInvoice.amount,
        mockInvoice.description,
        InvoiceStatus.PENDING,
        mockInvoice.createdAt,
        mockInvoice.updatedAt,
      );

      repository.create.mockResolvedValue(invoiceWithDefaultStatus);
      auditService.log.mockResolvedValue();

      const result = await useCase.execute(dtoWithoutStatus);

      expect(repository.create).toHaveBeenCalledWith({
        userId: dtoWithoutStatus.userId,
        amount: dtoWithoutStatus.amount,
        description: dtoWithoutStatus.description,
        status: InvoiceStatus.PENDING,
      });
      expect(result.status).toBe(InvoiceStatus.PENDING);
    });

    it('should work without audit service', async () => {
      const moduleWithoutAudit: TestingModule = await Test.createTestingModule({
        providers: [
          CreateInvoiceUseCase,
          {
            provide: INVOICE_REPOSITORY_TOKEN,
            useValue: repository,
          },
        ],
      }).compile();

      const useCaseWithoutAudit =
        moduleWithoutAudit.get<CreateInvoiceUseCase>(CreateInvoiceUseCase);

      repository.create.mockResolvedValue(mockInvoice);

      const result = await useCaseWithoutAudit.execute(createInvoiceDto);

      expect(result).toEqual(mockInvoice);
    });
  });
});
