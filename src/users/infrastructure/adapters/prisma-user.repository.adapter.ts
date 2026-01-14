import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/database/prisma/prisma.service';
import { User } from '@users/domain/entities/user.entity';
import {
  type IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '@users/domain/ports/user.repository.port';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class PrismaUserRepositoryAdapter implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });

    return User.fromPrisma({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return User.fromPrisma({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) {
      return null;
    }

    return User.fromPrisma({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaUsers.map((prismaUser) => {
      return User.fromPrisma({
        id: prismaUser.id,
        email: prismaUser.email,
        name: prismaUser.name,
        password: prismaUser.password,
        isActive: prismaUser.isActive,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
      });
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};

    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.password !== undefined) {
      updateData.password = data.password;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    const prismaUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return User.fromPrisma({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      password: prismaUser.password,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
