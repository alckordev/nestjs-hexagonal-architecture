import { Test, TestingModule } from '@nestjs/testing';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import {
  CreateInvoiceData,
  UpdateInvoiceData,
} from '@invoices/domain/ports/invoice.repository.port';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

// Mock PrismaService before importing the adapter
jest.mock('@database/prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({
      invoice: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };
});

import { PrismaInvoiceRepositoryAdapter } from './prisma-invoice.repository.adapter';
import { PrismaService } from '@database/prisma/prisma.service';

describe('PrismaInvoiceRepositoryAdapter', () => {
  let adapter: PrismaInvoiceRepositoryAdapter;
  let prismaService: {
    invoice: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  const mockPrismaInvoice = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-id',
    amount: 100.5,
    description: 'Test invoice',
    status: InvoiceStatus.PENDING,
    deletedAt: null,
    createdAt: mockDate,
    updatedAt: mockUpdatedDate,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      invoice: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaInvoiceRepositoryAdapter,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    adapter = module.get<PrismaInvoiceRepositoryAdapter>(
      PrismaInvoiceRepositoryAdapter,
    );
    prismaService = mockPrismaService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice and return Invoice entity', async () => {
      const createData: CreateInvoiceData = {
        userId: 'user-id',
        amount: 100.5,
        description: 'Test invoice',
        status: InvoiceStatus.PENDING,
      };

      prismaService.invoice.create.mockResolvedValue(mockPrismaInvoice as any);

      const result = await adapter.create(createData);

      expect(prismaService.invoice.create).toHaveBeenCalledWith({
        data: {
          userId: createData.userId,
          amount: createData.amount,
          description: createData.description,
          status: createData.status,
        },
      });
      expect(result).toBeInstanceOf(Invoice);
      expect(result.userId).toBe(createData.userId);
      expect(result.amount).toBe(createData.amount);
      expect(result.description).toBe(createData.description);
    });

    it('should use PENDING as default status if not provided', async () => {
      const createData: CreateInvoiceData = {
        userId: 'user-id',
        amount: 100.5,
        description: 'Test invoice',
      };

      prismaService.invoice.create.mockResolvedValue(mockPrismaInvoice as any);

      await adapter.create(createData);

      expect(prismaService.invoice.create).toHaveBeenCalledWith({
        data: {
          userId: createData.userId,
          amount: createData.amount,
          description: createData.description,
          status: 'PENDING',
        },
      });
    });
  });

  describe('findById', () => {
    it('should return an Invoice when found', async () => {
      prismaService.invoice.findUnique.mockResolvedValue(
        mockPrismaInvoice as any,
      );

      const result = await adapter.findById(mockPrismaInvoice.id);

      expect(prismaService.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: mockPrismaInvoice.id },
      });
      expect(result).toBeInstanceOf(Invoice);
      expect(result?.id).toBe(mockPrismaInvoice.id);
    });

    it('should return null when invoice not found', async () => {
      prismaService.invoice.findUnique.mockResolvedValue(null);

      const result = await adapter.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null when invoice is soft-deleted', async () => {
      const deletedInvoice = {
        ...mockPrismaInvoice,
        deletedAt: new Date(),
      };
      prismaService.invoice.findUnique.mockResolvedValue(deletedInvoice as any);

      const result = await adapter.findById(mockPrismaInvoice.id);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return an array of Invoices for a user', async () => {
      const mockInvoices = [
        mockPrismaInvoice,
        { ...mockPrismaInvoice, id: 'another-id' },
      ];
      prismaService.invoice.findMany.mockResolvedValue(mockInvoices as any);

      const result = await adapter.findByUserId('user-id');

      expect(prismaService.invoice.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Invoice);
    });

    it('should return empty array when no invoices found for user', async () => {
      prismaService.invoice.findMany.mockResolvedValue([]);

      const result = await adapter.findByUserId('user-id');

      expect(prismaService.invoice.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return an array of Invoices', async () => {
      const mockInvoices = [
        mockPrismaInvoice,
        { ...mockPrismaInvoice, id: 'another-id' },
      ];
      prismaService.invoice.findMany.mockResolvedValue(mockInvoices as any);

      const result = await adapter.findAll();

      expect(prismaService.invoice.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Invoice);
    });

    it('should return empty array when no non-deleted invoices exist', async () => {
      prismaService.invoice.findMany.mockResolvedValue([]);

      const result = await adapter.findAll();

      expect(prismaService.invoice.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update invoice and return updated Invoice entity', async () => {
      const updateData: UpdateInvoiceData = {
        amount: 200.5,
      };

      const updatedPrismaInvoice = {
        ...mockPrismaInvoice,
        amount: updateData.amount,
      };

      prismaService.invoice.update.mockResolvedValue(
        updatedPrismaInvoice as any,
      );

      const result = await adapter.update(mockPrismaInvoice.id, updateData);

      expect(prismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: mockPrismaInvoice.id },
        data: { amount: updateData.amount },
      });
      expect(result).toBeInstanceOf(Invoice);
      expect(result.amount).toBe(updateData.amount);
    });

    it('should only update provided fields', async () => {
      const updateData: UpdateInvoiceData = {
        status: InvoiceStatus.PAID,
      };

      const updatedPrismaInvoice = {
        ...mockPrismaInvoice,
        status: InvoiceStatus.PAID,
      };

      prismaService.invoice.update.mockResolvedValue(
        updatedPrismaInvoice as any,
      );

      const result = await adapter.update(mockPrismaInvoice.id, updateData);

      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(result.amount).toBe(mockPrismaInvoice.amount);
    });

    it('should handle multiple fields update', async () => {
      const updateData: UpdateInvoiceData = {
        amount: 300.5,
        description: 'Updated description',
        status: InvoiceStatus.CANCELLED,
      };

      const updatedPrismaInvoice = {
        ...mockPrismaInvoice,
        ...updateData,
      };

      prismaService.invoice.update.mockResolvedValue(
        updatedPrismaInvoice as any,
      );

      const result = await adapter.update(mockPrismaInvoice.id, updateData);

      expect(prismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: mockPrismaInvoice.id },
        data: updateData,
      });
      expect(result.amount).toBe(updateData.amount);
      expect(result.description).toBe(updateData.description);
      expect(result.status).toBe(updateData.status);
    });
  });

  describe('delete', () => {
    it('should soft delete an invoice by setting deletedAt timestamp', async () => {
      const deletedAt = new Date();
      const updatedInvoice = { ...mockPrismaInvoice, deletedAt };
      prismaService.invoice.update.mockResolvedValue(updatedInvoice as any);

      await adapter.delete(mockPrismaInvoice.id);

      // Soft delete: sets deletedAt to current timestamp instead of physical deletion
      expect(prismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: mockPrismaInvoice.id },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(prismaService.invoice.delete).not.toHaveBeenCalled();
    });
  });
});
