/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { CreateInvoiceUseCase } from '@invoices/application/use-cases/create-invoice.use-case';
import { GetInvoiceUseCase } from '@invoices/application/use-cases/get-invoice.use-case';
import { GetAllInvoicesUseCase } from '@invoices/application/use-cases/get-all-invoices.use-case';
import { GetInvoicesByUserUseCase } from '@invoices/application/use-cases/get-invoices-by-user.use-case';
import { UpdateInvoiceUseCase } from '@invoices/application/use-cases/update-invoice.use-case';
import { DeleteInvoiceUseCase } from '@invoices/application/use-cases/delete-invoice.use-case';
import { Invoice } from '@invoices/domain/entities/invoice.entity';
import { InvoiceStatus } from '@invoices/domain/enums/invoice-status.enum';
import { CreateInvoiceDto } from '@invoices/application/dto/create-invoice.dto';
import { UpdateInvoiceDto } from '@invoices/application/dto/update-invoice.dto';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let createInvoiceUseCase: jest.Mocked<CreateInvoiceUseCase>;
  let getInvoiceUseCase: jest.Mocked<GetInvoiceUseCase>;
  let getAllInvoicesUseCase: jest.Mocked<GetAllInvoicesUseCase>;
  let getInvoicesByUserUseCase: jest.Mocked<GetInvoicesByUserUseCase>;
  let updateInvoiceUseCase: jest.Mocked<UpdateInvoiceUseCase>;
  let deleteInvoiceUseCase: jest.Mocked<DeleteInvoiceUseCase>;

  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  const mockInvoice: Invoice = new Invoice(
    '123e4567-e89b-12d3-a456-426614174000',
    'user-id',
    100.5,
    'Test invoice',
    InvoiceStatus.PENDING,
    null,
    mockDate,
    mockUpdatedDate,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: CreateInvoiceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetInvoiceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAllInvoicesUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetInvoicesByUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateInvoiceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteInvoiceUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    createInvoiceUseCase = module.get(CreateInvoiceUseCase);
    getInvoiceUseCase = module.get(GetInvoiceUseCase);
    getAllInvoicesUseCase = module.get(GetAllInvoicesUseCase);
    getInvoicesByUserUseCase = module.get(GetInvoicesByUserUseCase);
    updateInvoiceUseCase = module.get(UpdateInvoiceUseCase);
    deleteInvoiceUseCase = module.get(DeleteInvoiceUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an invoice and return InvoiceResponseDto', async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        userId: 'user-id',
        amount: 100.5,
        description: 'Test invoice',
        status: InvoiceStatus.PENDING,
      };

      createInvoiceUseCase.execute.mockResolvedValue(mockInvoice);

      const result = await controller.create(createInvoiceDto);

      expect(createInvoiceUseCase.execute).toHaveBeenCalledWith(
        createInvoiceDto,
      );
      expect(result).toEqual({
        id: mockInvoice.id,
        userId: mockInvoice.userId,
        amount: mockInvoice.amount,
        description: mockInvoice.description,
        status: mockInvoice.status,
        createdAt: mockInvoice.createdAt,
        updatedAt: mockInvoice.updatedAt,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of InvoiceResponseDto', async () => {
      const mockInvoices = [mockInvoice];
      getAllInvoicesUseCase.execute.mockResolvedValue(mockInvoices);

      const result = await controller.findAll();

      expect(getAllInvoicesUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockInvoice.id);
      expect(result[0].userId).toBe(mockInvoice.userId);
    });
  });

  describe('findByUser', () => {
    it('should return an array of InvoiceResponseDto for a user', async () => {
      const userId = 'user-id';
      const mockInvoices = [mockInvoice];
      getInvoicesByUserUseCase.execute.mockResolvedValue(mockInvoices);

      const result = await controller.findByUser(userId);

      expect(getInvoicesByUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(userId);
    });
  });

  describe('findOne', () => {
    it('should return an InvoiceResponseDto by id', async () => {
      const invoiceId = mockInvoice.id;
      getInvoiceUseCase.execute.mockResolvedValue(mockInvoice);

      const result = await controller.findOne(invoiceId);

      expect(getInvoiceUseCase.execute).toHaveBeenCalledWith(invoiceId);
      expect(result.id).toBe(invoiceId);
    });
  });

  describe('update', () => {
    it('should update an invoice and return InvoiceResponseDto', async () => {
      const invoiceId = mockInvoice.id;
      const updateInvoiceDto: UpdateInvoiceDto = {
        amount: 200.5,
      };

      const updatedInvoice = new Invoice(
        invoiceId,
        mockInvoice.userId,
        updateInvoiceDto.amount!,
        mockInvoice.description,
        mockInvoice.status,
        null,
        mockInvoice.createdAt,
        new Date(),
      );

      updateInvoiceUseCase.execute.mockResolvedValue(updatedInvoice);

      const result = await controller.update(invoiceId, updateInvoiceDto);

      expect(updateInvoiceUseCase.execute).toHaveBeenCalledWith(
        invoiceId,
        updateInvoiceDto,
      );
      expect(result.amount).toBe(updateInvoiceDto.amount);
    });
  });

  describe('remove', () => {
    it('should delete an invoice', async () => {
      const invoiceId = mockInvoice.id;
      deleteInvoiceUseCase.execute.mockResolvedValue();

      await controller.remove(invoiceId);

      expect(deleteInvoiceUseCase.execute).toHaveBeenCalledWith(invoiceId);
    });
  });
});
