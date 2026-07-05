# NestJS Testing Workflow

## Base Workflow
Follow `rules/testing-rules.md` for NestJS-specific testing constraints. This document details the step-by-step process.

---

## Step 1: Unit Testing (Services)

**Goal:** Test a single Provider (Service) in isolation by mocking its injected dependencies.

1. Locate the `.spec.ts` file next to your service (the CLI generates this automatically).
2. Define mock objects for any injected dependencies (like a Repository).
3. Use `Test.createTestingModule` to compile a module specifically for this test.
4. Override the real providers with your mock values.

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  
  // 1. Mock the Repository
  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // 2. Setup the Testing Module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), // Token for TypeORM injection
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    // 3. Arrange
    mockRepository.findOne.mockResolvedValue(null);

    // 4. Act & Assert
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });
});
```

---

## Step 2: Unit Testing (Controllers)

**Goal:** Verify the controller extracts data correctly and calls the Service. Do NOT test business logic here.

```typescript
// users.controller.spec.ts
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn((dto) => {
      return { id: 1, ...dto };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should call UsersService.create', async () => {
    const dto = { email: 'test@test.com', name: 'Test', password: '123' };
    expect(await controller.create(dto)).toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});
```

---

## Step 3: End-to-End (E2E) Testing

**Goal:** Test the full HTTP request lifecycle, including Global Pipes, Guards, and Database writes.

1. Ensure you have an isolated test database (e.g., PostgreSQL in Docker, or an SQLite in-memory DB).
2. Write tests in the `test/` directory.

```typescript
// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // 1. Compile the real AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 2. Replicate main.ts setup!
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) - fails validation', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'not-an-email' }) // Missing password, invalid email
      .expect(400); // Bad Request expected due to ValidationPipe
  });
});
```

---

## Quality Checklist

- [ ] Unit tests for Services override injected dependencies (Repositories/HttpService) with mocks.
- [ ] Controller unit tests mock the injected Service.
- [ ] `beforeEach` is used to instantiate the `TestingModule` to ensure a fresh container per test.
- [ ] E2E tests manually re-apply global configurations (like `ValidationPipe`) before calling `app.init()`.
- [ ] E2E tests use `supertest` to verify actual HTTP status codes and JSON response shapes.
