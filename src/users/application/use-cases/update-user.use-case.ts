import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/ports/user.repository.port';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar si el usuario existe
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(
        updateUserDto.email,
      );

      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException(
          `El email ${updateUserDto.email} ya está en uso`,
        );
      }
    }

    return await this.userRepository.update(id, updateUserDto);
  }
}
