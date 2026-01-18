/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateInvoiceUseCase } from './update-invoice.use-case';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { AuditService } from '@audit/application/services/audit.service';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';

describe('UpdateInvoiceUseCase', () => {
  let useCase: UpdateInvoiceUseCase;
  let repository: jest.Mocked<IInvoiceRepository>;
  let auditService: jest.Mocked<AuditService>;

  const invoiceId = 'invoice-id';
  const existingInvoice: Invoice = new Invoice(
    invoiceId,
    'user-id',
    100.5,
    'Original description',
    InvoiceStatus.PENDING,
    new Date(),
    new Date(),
  );

  const updateInvoiceDto: UpdateInvoiceDto = {
    amount: 150.75,
    description: 'Updated description',
    status: InvoiceStatus.PAID,
  };

  const updatedInvoice: Invoice = new Invoice(
    invoiceId,
    existingInvoice.userId,
    updateInvoiceDto.amount!,
    updateInvoiceDto.description!,
    updateInvoiceDto.status!,
    existingInvoice.createdAt,
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
        UpdateInvoiceUseCase,
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

    useCase = module.get<UpdateInvoiceUseCase>(UpdateInvoiceUseCase);
    repository = module.get(INVOICE_REPOSITORY_TOKEN);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update an invoice successfully', async () => {
      repository.findById.mockResolvedValue(existingInvoice);
      repository.update.mockResolvedValue(updatedInvoice);
      auditService.log.mockResolvedValue();

      const result = await useCase.execute(invoiceId, updateInvoiceDto, {
        userId: 'audit-user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(repository.findById).toHaveBeenCalledWith(invoiceId);
      expect(repository.update).toHaveBeenCalledWith(
        invoiceId,
        updateInvoiceDto,
      );
      expect(result).toEqual(updatedInvoice);
    });

    it('should throw NotFoundException if invoice does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(invoiceId, updateInvoiceDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        useCase.execute(invoiceId, updateInvoiceDto),
      ).rejects.toThrow(`Invoice with id ${invoiceId} not found`);

      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should work without audit service', async () => {
      const moduleWithoutAudit: TestingModule = await Test.createTestingModule({
        providers: [
          UpdateInvoiceUseCase,
          {
            provide: INVOICE_REPOSITORY_TOKEN,
            useValue: repository,
          },
        ],
      }).compile();

      const useCaseWithoutAudit =
        moduleWithoutAudit.get<UpdateInvoiceUseCase>(UpdateInvoiceUseCase);

      repository.findById.mockResolvedValue(existingInvoice);
      repository.update.mockResolvedValue(updatedInvoice);

      const result = await useCaseWithoutAudit.execute(
        invoiceId,
        updateInvoiceDto,
      );

      expect(result).toEqual(updatedInvoice);
    });
  });
});
