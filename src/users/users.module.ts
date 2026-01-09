import { Module } from '@nestjs/common';
import { UsersController } from './infrastructure/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { PrismaUserRepositoryAdapter } from './infrastructure/adapters/prisma-user.repository.adapter';

@Module({
  controllers: [UsersController],
  providers: [
    // Use cases
    CreateUserUseCase,
    GetUserUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    // Repository (port implementation)
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepositoryAdapter,
    },
    // Also provide the adapter directly for injection
    PrismaUserRepositoryAdapter,
  ],
  exports: [CreateUserUseCase, GetUserUseCase, GetAllUsersUseCase],
})
export class UsersModule {}
