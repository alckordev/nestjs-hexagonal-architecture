import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import {
  type IInvoiceRepository,
  CreateInvoiceData,
  UpdateInvoiceData,
} from '@invoices/domain/ports/invoice.repository.port';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class PrismaInvoiceRepositoryAdapter implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInvoiceData): Promise<Invoice> {
    const prismaInvoice = await this.prisma.invoice.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        description: data.description,
        status: data.status || 'PENDING',
      },
    });

    return Invoice.fromPrisma({
      id: prismaInvoice.id,
      userId: prismaInvoice.userId,
      amount: prismaInvoice.amount,
      description: prismaInvoice.description,
      status: prismaInvoice.status,
      deletedAt: prismaInvoice.deletedAt,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt,
    });
  }

  async findById(id: string): Promise<Invoice | null> {
    const prismaInvoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!prismaInvoice || prismaInvoice.deletedAt !== null) {
      return null;
    }

    return Invoice.fromPrisma({
      id: prismaInvoice.id,
      userId: prismaInvoice.userId,
      amount: prismaInvoice.amount,
      description: prismaInvoice.description,
      status: prismaInvoice.status,
      deletedAt: prismaInvoice.deletedAt,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<Invoice[]> {
    const prismaInvoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaInvoices.map((prismaInvoice) => {
      return Invoice.fromPrisma({
        id: prismaInvoice.id,
        userId: prismaInvoice.userId,
        amount: prismaInvoice.amount,
        description: prismaInvoice.description,
        status: prismaInvoice.status,
        deletedAt: prismaInvoice.deletedAt,
        createdAt: prismaInvoice.createdAt,
        updatedAt: prismaInvoice.updatedAt,
      });
    });
  }

  async findAll(): Promise<Invoice[]> {
    const prismaInvoices = await this.prisma.invoice.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return prismaInvoices.map((prismaInvoice) => {
      return Invoice.fromPrisma({
        id: prismaInvoice.id,
        userId: prismaInvoice.userId,
        amount: prismaInvoice.amount,
        description: prismaInvoice.description,
        status: prismaInvoice.status,
        deletedAt: prismaInvoice.deletedAt,
        createdAt: prismaInvoice.createdAt,
        updatedAt: prismaInvoice.updatedAt,
      });
    });
  }

  async update(id: string, data: UpdateInvoiceData): Promise<Invoice> {
    const updateData: Prisma.InvoiceUpdateInput = {};

    if (data.amount !== undefined) {
      updateData.amount = data.amount;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const prismaInvoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    return Invoice.fromPrisma({
      id: prismaInvoice.id,
      userId: prismaInvoice.userId,
      amount: prismaInvoice.amount,
      description: prismaInvoice.description,
      status: prismaInvoice.status,
      deletedAt: prismaInvoice.deletedAt,
      createdAt: prismaInvoice.createdAt,
      updatedAt: prismaInvoice.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    // Soft delete: set deletedAt to current timestamp
    await this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
