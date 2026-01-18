import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    description: 'Invoice amount',
    example: 150.75,
    minimum: 0.01,
    type: Number,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Invoice description',
    example: 'Updated invoice description',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(500, {
    message: 'description must not exceed 500 characters',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.PAID,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus, {
    message: `status must be one of: ${Object.values(InvoiceStatus).join(', ')}`,
  })
  status?: InvoiceStatus;
}
