# Testing Rules

## Purpose

Rules for writing Unit and End-to-End (e2e) tests in NestJS, focusing on isolation, mocking, and leveraging the `TestingModule`.

---

## Unit Testing Rules — MUST

### 1. Test Isolation via `TestingModule`
You MUST use Nest's `Test.createTestingModule` to instantiate the class you are testing. You MUST NOT instantiate it manually with `new`.

### 2. Mocking Dependencies
When unit testing a Service or Controller, you MUST mock its dependencies (like Repositories or other Services). Do not connect to a real database in a unit test.

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  // 1. Create a mock object
  const mockUserRepository = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
  };

  beforeEach(async () => {
    // 2. Set up the Testing Module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), // Overrides the real repository injection
          useValue: mockUserRepository,      // Injects our mock instead
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## End-to-End (e2e) Testing Rules — MUST

E2E tests verify the entire HTTP lifecycle (Guards → Interceptors → Pipes → Controller → Service → DB). 

### 3. Separate E2E Configuration
E2E tests MUST be stored in the `test/` directory, completely separate from unit tests (which live next to the files they test).

### 4. Use a Test Database
E2E tests MUST connect to an isolated test database. They MUST NOT run against development or production databases.

### 5. Application Bootstrapping
You MUST bootstrap the entire Nest application to use `supertest`.

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // IMPORTANT: Apply the same global pipes/filters used in main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201);
  });
});
```

---

## Quality Checklist

- [ ] Unit tests (`.spec.ts`) are co-located with the files they test.
- [ ] Unit tests use `Test.createTestingModule` and mock all dependencies (e.g., Repositories).
- [ ] E2E tests (`.e2e-spec.ts`) are located in the `test/` directory.
- [ ] E2E tests bootstrap the `AppModule` and replicate the `main.ts` setup (Global Pipes, Filters).
- [ ] E2E tests assert HTTP status codes and JSON response shapes.
