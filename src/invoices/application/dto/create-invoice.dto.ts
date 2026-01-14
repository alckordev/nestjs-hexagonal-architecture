import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

export class CreateInvoiceDto {
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;

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
