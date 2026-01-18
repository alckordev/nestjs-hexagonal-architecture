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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice successfully created',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.createInvoiceUseCase.execute(createInvoiceDto);
    return this.mapToResponseDto(invoice);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all invoices',
    type: [InvoiceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async findAll(): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getAllInvoicesUseCase.execute();
    return invoices.map((invoice) => this.mapToResponseDto(invoice));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all invoices by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of invoices for the user',
    type: [InvoiceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<InvoiceResponseDto[]> {
    const invoices = await this.getInvoicesByUserUseCase.execute(userId);
    return invoices.map((invoice) => this.mapToResponseDto(invoice));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice found',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.getInvoiceUseCase.execute(id);
    return this.mapToResponseDto(invoice);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice successfully updated',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Invoice successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
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
