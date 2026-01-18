import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

export class InvoiceResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid', format: 'uuid' })
  userId: string;

  @ApiProperty({ example: 100.5, type: Number })
  amount: number;

  @ApiProperty({ example: 'Monthly subscription payment', nullable: true })
  description: string | null;

  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
