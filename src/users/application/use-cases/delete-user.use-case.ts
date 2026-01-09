import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/ports/user.repository.port';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.delete(id);
  }
}
