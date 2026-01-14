import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import type { IUserRepository } from '@users/domain/ports/user.repository.port';
import { CreateUserDto } from '@users/application/dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    return await this.userRepository.create(createUserDto);
  }
}
