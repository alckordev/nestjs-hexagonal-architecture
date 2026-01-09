import { Module } from '@nestjs/common';
import { UsersController } from './infrastructure/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { PrismaUserRepositoryAdapter } from './infrastructure/adapters/prisma-user.repository.adapter';
import { IUserRepository } from './domain/ports/user.repository.port';

@Module({
  controllers: [UsersController],
  providers: [
    // Casos de uso
    CreateUserUseCase,
    GetUserUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    // Repositorio (implementación del puerto)
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepositoryAdapter,
    },
    // También proporcionamos el adaptador directamente para inyección
    PrismaUserRepositoryAdapter,
  ],
  exports: [CreateUserUseCase, GetUserUseCase, GetAllUsersUseCase],
})
export class UsersModule {}
