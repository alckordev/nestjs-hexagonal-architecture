import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  amount?: number;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(500, {
    message: 'description must not exceed 500 characters',
  })
  description?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus, {
    message: `status must be one of: ${Object.values(InvoiceStatus).join(', ')}`,
  })
  status?: InvoiceStatus;
}
