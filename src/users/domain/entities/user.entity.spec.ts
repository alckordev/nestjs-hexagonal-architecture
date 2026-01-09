import { User } from './user.entity';

describe('User Entity', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2024-01-02T00:00:00.000Z');

  describe('fromPrisma', () => {
    it('should create a User instance from Prisma data', () => {
      const prismaData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const user = User.fromPrisma(prismaData);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(prismaData.id);
      expect(user.email).toBe(prismaData.email);
      expect(user.name).toBe(prismaData.name);
      expect(user.password).toBe(prismaData.password);
      expect(user.isActive).toBe(prismaData.isActive);
      expect(user.createdAt).toBe(prismaData.createdAt);
      expect(user.updatedAt).toBe(prismaData.updatedAt);
    });

    it('should handle inactive user', () => {
      const prismaData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        isActive: false,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      };

      const user = User.fromPrisma(prismaData);

      expect(user.isActive).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return user data without password', () => {
      const user = new User(
        '123e4567-e89b-12d3-a456-426614174000',
        'test@example.com',
        'Test User',
        'hashedPassword',
        true,
        mockDate,
        mockUpdatedDate,
      );

      const json = user.toJSON();

      expect(json).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockUpdatedDate,
      });
      expect(json).not.toHaveProperty('password');
    });
  });
});
