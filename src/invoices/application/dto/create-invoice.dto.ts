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
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'User ID who owns the invoice',
    example: 'uuid',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @ApiProperty({
    description: 'Invoice amount',
    example: 100.5,
    minimum: 0.01,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;

  @ApiProperty({
    description: 'Invoice description',
    example: 'Monthly subscription payment',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(500, {
    message: 'description must not exceed 500 characters',
  })
  description?: string;

  @ApiProperty({
    description: 'Invoice status',
    enum: InvoiceStatus,
    example: InvoiceStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus, {
    message: `status must be one of: ${Object.values(InvoiceStatus).join(', ')}`,
  })
  status?: InvoiceStatus;
}
