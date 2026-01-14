import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}
