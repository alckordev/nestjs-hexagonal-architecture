import { Injectable, Inject } from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
