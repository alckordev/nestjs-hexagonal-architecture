import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { USER_REPOSITORY_TOKEN } from '@users/domain/ports/user.repository.token';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly repository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.repository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.repository.delete(id);
  }
}
