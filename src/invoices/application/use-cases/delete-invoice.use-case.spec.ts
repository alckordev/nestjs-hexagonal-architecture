/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteInvoiceUseCase } from './delete-invoice.use-case';
import type { IInvoiceRepository } from '@invoices/domain/ports/invoice.repository.port';
import { INVOICE_REPOSITORY_TOKEN } from '@invoices/domain/ports/invoice.repository.token';
import { AuditService } from '@audit/application/services/audit.service';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

describe('DeleteInvoiceUseCase', () => {
  let useCase: DeleteInvoiceUseCase;
  let repository: jest.Mocked<IInvoiceRepository>;
  let auditService: jest.Mocked<AuditService>;

  const invoiceId = 'invoice-id';
  const existingInvoice: Invoice = new Invoice(
    invoiceId,
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

    const mockAuditService: jest.Mocked<AuditService> = {
      log: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteInvoiceUseCase,
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

    useCase = module.get<DeleteInvoiceUseCase>(DeleteInvoiceUseCase);
    repository = module.get(INVOICE_REPOSITORY_TOKEN);
    auditService = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should soft delete an invoice successfully', async () => {
      repository.findById.mockResolvedValue(existingInvoice);
      repository.delete.mockResolvedValue();
      auditService.log.mockResolvedValue();

      await useCase.execute(invoiceId, {
        userId: 'audit-user-id',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(repository.findById).toHaveBeenCalledWith(invoiceId);
      // Soft delete: sets deletedAt timestamp instead of physical deletion
      expect(repository.delete).toHaveBeenCalledWith(invoiceId);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'Invoice',
          entityId: invoiceId,
          action: 'DELETE',
        }),
      );
    });

    it('should throw NotFoundException if invoice does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(invoiceId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(invoiceId)).rejects.toThrow(
        `Invoice with id ${invoiceId} not found`,
      );

      // Should not attempt soft delete if invoice doesn't exist
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if invoice is already deleted', async () => {
      // findById returns null for soft-deleted invoices
      repository.findById.mockResolvedValue(null);

      await expect(useCase.execute(invoiceId)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should work without audit service', async () => {
      const moduleWithoutAudit: TestingModule = await Test.createTestingModule({
        providers: [
          DeleteInvoiceUseCase,
          {
            provide: INVOICE_REPOSITORY_TOKEN,
            useValue: repository,
          },
        ],
      }).compile();

      const useCaseWithoutAudit =
        moduleWithoutAudit.get<DeleteInvoiceUseCase>(DeleteInvoiceUseCase);

      repository.findById.mockResolvedValue(existingInvoice);
      repository.delete.mockResolvedValue();

      await expect(
        useCaseWithoutAudit.execute(invoiceId),
      ).resolves.not.toThrow();

      expect(repository.delete).toHaveBeenCalledWith(invoiceId);
    });
  });
});
