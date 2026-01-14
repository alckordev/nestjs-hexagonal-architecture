import { Invoice } from '../entities/invoice.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export interface CreateInvoiceData {
  userId: string;
  amount: number;
  description?: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceData {
  amount?: number;
  description?: string;
  status?: InvoiceStatus;
}

export interface IInvoiceRepository {
  create(data: CreateInvoiceData): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByUserId(userId: string): Promise<Invoice[]>;
  findAll(): Promise<Invoice[]>;
  update(id: string, data: UpdateInvoiceData): Promise<Invoice>;
  delete(id: string): Promise<void>;
}
