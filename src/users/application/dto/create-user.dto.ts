import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  @MaxLength(255, {
    message: 'password must not exceed 255 characters',
  })
  password: string;
}
