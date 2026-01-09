/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { GetAllUsersUseCase } from '../../application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let getUserUseCase: jest.Mocked<GetUserUseCase>;
  let getAllUsersUseCase: jest.Mocked<GetAllUsersUseCase>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  const mockUser: User = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'Test User',
    'hashedPassword',
    true,
    mockDate,
    mockUpdatedDate,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAllUsersUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUserUseCase = module.get(CreateUserUseCase);
    getUserUseCase = module.get(GetUserUseCase);
    getAllUsersUseCase = module.get(GetAllUsersUseCase);
    updateUserUseCase = module.get(UpdateUserUseCase);
    deleteUserUseCase = module.get(DeleteUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return UserResponseDto', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      createUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return an array of UserResponseDto', async () => {
      const mockUsers = [mockUser];
      getAllUsersUseCase.execute.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(getAllUsersUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0].email).toBe(mockUser.email);
    });
  });

  describe('findOne', () => {
    it('should return a UserResponseDto by id', async () => {
      const userId = mockUser.id;
      getUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(getUserUseCase.execute).toHaveBeenCalledWith(userId);
      expect(result.id).toBe(userId);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('should update a user and return UserResponseDto', async () => {
      const userId = mockUser.id;
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = new User(
        userId,
        mockUser.email,
        updateUserDto.name!,
        mockUser.password,
        mockUser.isActive,
        mockUser.createdAt,
        new Date(),
      );

      updateUserUseCase.execute.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(result.name).toBe(updateUserDto.name);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = mockUser.id;
      deleteUserUseCase.execute.mockResolvedValue();

      await controller.remove(userId);

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });
});
