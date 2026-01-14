export class InvoiceResponseDto {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
