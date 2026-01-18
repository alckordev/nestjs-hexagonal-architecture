/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUsersUseCase } from './get-all-users.use-case';
import { IUserRepository } from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';

describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;
  let repository: jest.Mocked<IUserRepository>;

  const mockUsers: User[] = [
    new User(
      '123e4567-e89b-12d3-a456-426614174000',
      'test1@example.com',
      'Test User 1',
      'hashedPassword1',
      true,
      null, // deletedAt
      new Date(),
      new Date(),
    ),
    new User(
      '123e4567-e89b-12d3-a456-426614174001',
      'test2@example.com',
      'Test User 2',
      'hashedPassword2',
      true,
      null, // deletedAt
      new Date(),
      new Date(),
    ),
  ];

  beforeEach(async () => {
    const mockRepository: jest.Mocked<IUserRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUsersUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllUsersUseCase>(GetAllUsersUseCase);
    repository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all users', async () => {
      repository.findAll.mockResolvedValue(mockUsers);

      const result = await useCase.execute();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
