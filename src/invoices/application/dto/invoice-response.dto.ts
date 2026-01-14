import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

export class InvoiceResponseDto {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}
