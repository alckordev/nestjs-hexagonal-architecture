# Testing Strategy

This document describes the testing strategy for the NestJS Hexagonal Architecture project.

## Test Structure

### Unit Tests (`*.spec.ts`)

Located alongside the source files in the `src/` directory.

#### Domain Layer Tests

- **User Entity** (`users/domain/entities/user.entity.spec.ts`)
  - Tests for entity creation from Prisma data
  - Tests for JSON serialization (excluding password)
  - Tests for inactive users

#### Application Layer Tests (Use Cases)

- **CreateUserUseCase** (`users/application/use-cases/create-user.use-case.spec.ts`)
  - Successfully creating a user
  - Conflict when email already exists
- **GetUserUseCase** (`users/application/use-cases/get-user.use-case.spec.ts`)
  - Retrieving a user by ID
  - NotFoundException when user doesn't exist
- **GetAllUsersUseCase** (`users/application/use-cases/get-all-users.use-case.spec.ts`)
  - Retrieving all users
  - Handling empty user list
- **UpdateUserUseCase** (`users/application/use-cases/update-user.use-case.spec.ts`)
  - Successfully updating a user
  - NotFoundException when user doesn't exist
  - ConflictException when email is already in use
  - Allowing same email update
- **DeleteUserUseCase** (`users/application/use-cases/delete-user.use-case.spec.ts`)
  - Successfully deleting a user
  - NotFoundException when user doesn't exist

#### Infrastructure Layer Tests

- **PrismaUserRepositoryAdapter** (`users/infrastructure/adapters/prisma-user.repository.adapter.spec.ts`)
  - All CRUD operations with mocked PrismaService
  - Data mapping from Prisma to domain entities
- **UsersController** (`users/infrastructure/controllers/users.controller.spec.ts`)
  - All REST endpoints with mocked use cases
  - Response DTO mapping (excluding password)

### E2E Tests (`*.e2e-spec.ts`)

Located in the `test/` directory.

#### Users E2E Tests (`test/users.e2e-spec.ts`)

- **POST /users** - Create user
  - Successfully create user
  - Validation errors (invalid email, short password)
  - Duplicate email conflict
- **GET /users** - List all users
  - Return array of users
- **GET /users/:id** - Get user by ID
  - Successfully retrieve user
  - 404 for non-existent user
- **PATCH /users/:id** - Update user
  - Successfully update user
  - 404 for non-existent user
  - Validation errors
- **DELETE /users/:id** - Delete user
  - Successfully delete user
  - 404 for non-existent user

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run specific test file
pnpm test users.entity.spec.ts

# Run tests matching a pattern
pnpm test create-user
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific E2E test file
pnpm test:e2e users.e2e-spec.ts
```

**Note:** E2E tests require a database connection. Make sure to:

1. Set up a test database in your `.env.test` or environment variables
2. Run database migrations: `pnpm prisma migrate dev`
3. Ensure `DATABASE_URL` is properly configured

## Test Coverage

Current coverage includes:

- ✅ Domain entities (User)
- ✅ All use cases (5 use cases)
- ✅ Repository adapter (PrismaUserRepositoryAdapter)
- ✅ Controller (UsersController)
- ✅ E2E endpoints

## Mocking Strategy

### Use Cases

- Mock `IUserRepository` interface
- Test business logic in isolation

### Repository Adapter

- Mock `PrismaService` completely
- Test data transformation from Prisma to domain entities

### Controller

- Mock all use cases
- Test HTTP layer and DTO mapping

### E2E Tests

- Use real database (test environment)
- Test full application flow
- Clean up test data after tests

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Mocks**: Use mocks to isolate units under test
3. **Descriptive Names**: Test names clearly describe what is being tested
4. **Arrange-Act-Assert**: Follow AAA pattern in test structure
5. **Edge Cases**: Test both happy paths and error scenarios
6. **Cleanup**: Clean up test data in E2E tests

## Adding New Tests

When adding new features:

1. **Domain**: Add tests for new entities/value objects
2. **Use Cases**: Add tests for new business logic
3. **Adapters**: Add tests for new repository implementations
4. **Controllers**: Add tests for new endpoints
5. **E2E**: Add integration tests for new endpoints

Follow the existing test patterns and structure.
