import { Invoice } from './invoice.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';

describe('Invoice Entity', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  describe('fromPrisma', () => {
    it('should create an Invoice instance from Prisma data with number amount', () => {
      const prismaData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-id',
        amount: 100.5,
        description: 'Test invoice',
        status: InvoiceStatus.PENDING,
        deletedAt: null,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const invoice = Invoice.fromPrisma(prismaData);

      expect(invoice).toBeInstanceOf(Invoice);
      expect(invoice.id).toBe(prismaData.id);
      expect(invoice.userId).toBe(prismaData.userId);
      expect(invoice.amount).toBe(100.5);
      expect(invoice.description).toBe(prismaData.description);
      expect(invoice.status).toBe(InvoiceStatus.PENDING);
      expect(invoice.deletedAt).toBeNull();
      expect(invoice.createdAt).toBe(prismaData.createdAt);
      expect(invoice.updatedAt).toBe(prismaData.updatedAt);
    });

    it('should create an Invoice instance from Prisma data with string amount', () => {
      const prismaData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-id',
        amount: '200.75' as unknown as number,
        description: 'Test invoice',
        status: InvoiceStatus.PAID,
        deletedAt: null,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const invoice = Invoice.fromPrisma(prismaData);

      expect(invoice.amount).toBe(200.75);
    });

    it('should create an Invoice instance from Prisma data with Decimal object amount', () => {
      const decimalObject = {
        toString: () => '300.25',
      };

      const prismaData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-id',
        amount: decimalObject as unknown as number,
        description: 'Test invoice',
        status: InvoiceStatus.CANCELLED,
        deletedAt: null,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const invoice = Invoice.fromPrisma(prismaData);

      expect(invoice.amount).toBe(300.25);
    });

    it('should handle deleted invoice', () => {
      const deletedDate = new Date('2024-01-03T00:00:00.000Z');
      const prismaData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-id',
        amount: 100.5,
        description: 'Deleted invoice',
        status: InvoiceStatus.PENDING,
        deletedAt: deletedDate,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const invoice = Invoice.fromPrisma(prismaData);

      expect(invoice.deletedAt).toEqual(deletedDate);
    });
  });

  describe('toJSON', () => {
    it('should return invoice data', () => {
      const invoice = new Invoice(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-id',
        100.5,
        'Test invoice',
        InvoiceStatus.PENDING,
        null,
        mockDate,
        mockUpdatedDate,
      );

      const json = invoice.toJSON();

      expect(json).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: 'user-id',
        amount: 100.5,
        description: 'Test invoice',
        status: InvoiceStatus.PENDING,
        deletedAt: null,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      });
    });

    it('should return invoice data with deletedAt when soft deleted', () => {
      const deletedDate = new Date('2024-01-03T00:00:00.000Z');
      const invoice = new Invoice(
        '123e4567-e89b-12d3-a456-426614174000',
        'user-id',
        100.5,
        'Deleted invoice',
        InvoiceStatus.PENDING,
        deletedDate,
        mockDate,
        mockUpdatedDate,
      );

      const json = invoice.toJSON();

      expect(json.deletedAt).toEqual(deletedDate);
    });
  });
});
