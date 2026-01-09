import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'password must be a string' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  @MaxLength(255, {
    message: 'password must not exceed 255 characters',
  })
  password?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
