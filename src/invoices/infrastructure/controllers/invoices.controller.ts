import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateInvoiceUseCase } from '@invoices/application/use-cases/create-invoice.use-case';
import { GetInvoiceUseCase } from '@invoices/application/use-cases/get-invoice.use-case';
import { GetAllInvoicesUseCase } from '@invoices/application/use-cases/get-all-invoices.use-case';
import { GetInvoicesByUserUseCase } from '@invoices/application/use-cases/get-invoices-by-user.use-case';
import { UpdateInvoiceUseCase } from '@invoices/application/use-cases/update-invoice.use-case';
import { DeleteInvoiceUseCase } from '@invoices/application/use-cases/delete-invoice.use-case';
import { CreateInvoiceDto } from '@invoices/application/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '@invoices/application/dto/update-invoice.dto';
import { InvoiceResponseDto } from '@invoices/application/dto/invoice-response.dto';
import { Invoice } from '@invoices/domain/entities/invoice.entity';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
    private readonly getInvoiceUseCase: GetInvoiceUseCase,
    private readonly getAllInvoicesUseCase: GetAllInvoicesUseCase,
    private readonly getInvoicesByUserUseCase: GetInvoicesByUserUseCase,
    private readonly updateInvoiceUseCase: UpdateInvoiceUseCase,
    private readonly deleteInvoiceUseCase: DeleteInvoiceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.createInvoiceUseCase.execute(createInvoiceDto);
    return this.mapToResponseDto(invoice);
  }

  @Get()
  async findAll(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getAllInvoicesUseCase.execute();
    return invoices.map((invoice) => this.mapToResponseDto(invoice));
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getInvoicesByUserUseCase.execute(userId);
    return invoices.map((invoice) => this.mapToResponseDto(invoice));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceUseCase.execute(id);
    return this.mapToResponseDto(invoice);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.updateInvoiceUseCase.execute(
      id,
      updateInvoiceDto,
    );
    return this.mapToResponseDto(invoice);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteInvoiceUseCase.execute(id);
  }

  private mapToResponseDto(invoice: Invoice): InvoiceResponseDto {
    return {
      id: invoice.id,
      userId: invoice.userId,
      amount: invoice.amount,
      description: invoice.description,
      status: invoice.status,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
    };
  }
}
