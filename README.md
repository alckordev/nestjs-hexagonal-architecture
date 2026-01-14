<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS application built with **Hexagonal Architecture** (Ports and Adapters). This project demonstrates a clean architecture approach with clear separation between domain, application, and infrastructure layers.

### Architecture Overview

This project follows **Hexagonal Architecture** principles:

- **Domain Layer**: Contains business entities and ports (interfaces)
- **Application Layer**: Contains use cases (business logic) and DTOs
- **Infrastructure Layer**: Contains adapters (implementations) and controllers

### Project Structure

```
src/
├── shared/
│   └── infrastructure/
│       ├── config/          # Configuration utilities
│       └── database/        # Database adapters (Prisma)
├── users/
│   ├── domain/              # Domain layer
│   │   ├── entities/        # Domain entities
│   │   └── ports/           # Repository interfaces (ports)
│   ├── application/         # Application layer
│   │   ├── dto/             # Data Transfer Objects
│   │   └── use-cases/       # Business logic (use cases)
│   └── infrastructure/      # Infrastructure layer
│       ├── adapters/        # Repository implementations (adapters)
│       └── controllers/     # REST controllers
└── app.module.ts            # Root module
```

## Project setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- PostgreSQL database

### Installation

```bash
$ pnpm install
```

### Database Setup

1. Create a PostgreSQL database
2. Create `.env.development` file in the root:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOSTNAME=localhost
POSTGRES_DB=your_database
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOSTNAME}:5432/${POSTGRES_DB}?schema=public
NODE_ENV=development
```

3. Generate Prisma Client and run migrations:

```bash
$ pnpm prisma:generate
$ pnpm prisma:migrate
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests (requires test database)
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov

# tests in watch mode
$ pnpm run test:watch
```

**Note:** E2E tests require a test database. See [TESTING.md](./TESTING.md) for more details.

## Path Aliases

This project uses path aliases to avoid relative imports (`../../`). Configured aliases:

```typescript
// Shared/Infrastructure
'@shared/*'           → 'src/shared/*'
'@config/*'           → 'src/shared/infrastructure/config/*'
'@database/*'         → 'src/shared/infrastructure/database/*'

// Users module
'@users/*'            → 'src/users/*'
'@users/domain/*'     → 'src/users/domain/*'
'@users/application/*' → 'src/users/application/*'
'@users/infrastructure/*' → 'src/users/infrastructure/*'
```

### Usage Example

```typescript
// ❌ Before (relative imports)
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

// ✅ After (path aliases)
import { User } from '@users/domain/entities/user.entity';
import { CreateUserDto } from '@users/application/dto/create-user.dto';
```

## Environment Variables

The project supports multiple environment files with automatic variable expansion:

- `.env.development` - Development environment
- `.env.test` - Test environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

**Variable Expansion:** The project automatically expands variables like `${VAR_NAME}` using `ConfigModule` with `expandVariables: true`.

Example:

```env
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOSTNAME}:5432/${POSTGRES_DB}
```

The system loads environment files dynamically based on `NODE_ENV` with fallback priority:

1. `.env.{NODE_ENV}` (environment-specific)
2. `.env.development` (fallback for non-production)
3. `.env` (base fallback)

## Available Scripts

```bash
# Development
pnpm start:dev          # Start in watch mode
pnpm start:debug        # Start in debug mode

# Testing
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run E2E tests

# Database
pnpm prisma:generate    # Generate Prisma Client
pnpm prisma:migrate     # Run database migrations

# Code Quality
pnpm lint               # Lint code
pnpm format             # Format code with Prettier
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
