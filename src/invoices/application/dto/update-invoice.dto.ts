import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

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
  @IsString({ message: 'status must be a string' })
  status?: string;
}
