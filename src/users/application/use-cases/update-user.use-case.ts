import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { UpdateUserDto } from '@users/application/dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // If updating email, verify it's not already in use by another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(
        updateUserDto.email,
      );

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(
          `Email ${updateUserDto.email} is already in use`,
        );
      }
    }

    return await this.userRepository.update(id, updateUserDto);
  }
}
