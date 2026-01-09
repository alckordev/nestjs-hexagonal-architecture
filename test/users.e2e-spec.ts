/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/shared/infrastructure/database/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up created test data
    if (createdUserId) {
      try {
        await prismaService.user.delete({
          where: { id: createdUserId },
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user successfully', () => {
      const createUserDto = {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.name).toBe(createUserDto.name);
          expect(res.body).not.toHaveProperty('password');
          expect(res.body.isActive).toBe(true);
          createdUserId = res.body.id;
        });
    });

    it('should fail with invalid email', () => {
      const createUserDto = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should fail with short password', () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: '12345', // Less than 6 characters
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should fail with duplicate email', async () => {
      const createUserDto = {
        email: `duplicate-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'password123',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(409);
    });
  });

  describe('GET /users', () => {
    it('should return an array of users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('email');
            expect(res.body[0]).not.toHaveProperty('password');
          }
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      if (!createdUserId) {
        // Create a user first if not exists
        const createUserDto = {
          email: `get-test-${Date.now()}@example.com`,
          name: 'Get Test User',
          password: 'password123',
        };

        const createResponse = await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201);

        createdUserId = createResponse.body.id;
      }

      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      return request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user successfully', async () => {
      if (!createdUserId) {
        const createUserDto = {
          email: `update-test-${Date.now()}@example.com`,
          name: 'Update Test User',
          password: 'password123',
        };

        const createResponse = await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201);

        createdUserId = createResponse.body.id;
      }

      const updateDto = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body.name).toBe(updateDto.name);
        });
    });

    it('should return 404 when updating non-existent user', () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const updateDto = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });

    it('should fail with invalid data', async () => {
      if (!createdUserId) {
        const createUserDto = {
          email: `update-invalid-${Date.now()}@example.com`,
          name: 'Test User',
          password: 'password123',
        };

        const createResponse = await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201);

        createdUserId = createResponse.body.id;
      }

      const updateDto = {
        name: 'A', // Less than 2 characters
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user successfully', async () => {
      // Create a user to delete
      const createUserDto = {
        email: `delete-test-${Date.now()}@example.com`,
        name: 'Delete Test User',
        password: 'password123',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const userIdToDelete = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/users/${userIdToDelete}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent user', () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

      return request(app.getHttpServer())
        .delete(`/users/${nonExistentId}`)
        .expect(404);
    });
  });
});
