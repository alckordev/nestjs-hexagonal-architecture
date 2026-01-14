import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateUserUseCase } from '@users/application/use-cases/create-user.use-case';
import { GetUserUseCase } from '@users/application/use-cases/get-user.use-case';
import { GetAllUsersUseCase } from '@users/application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '@users/application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@users/application/use-cases/delete-user.use-case';
import { CreateUserDto } from '@users/application/dto/create-user.dto';
import { UpdateUserDto } from '@users/application/dto/update-user.dto';
import { UserResponseDto } from '@users/application/dto/user-response.dto';
import { User } from '@users/domain/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return this.mapToResponseDto(user);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.getAllUsersUseCase.execute();
    return users.map((user) => this.mapToResponseDto(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(id);
    return this.mapToResponseDto(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    return this.mapToResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
