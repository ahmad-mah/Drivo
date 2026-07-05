# Node.js Testing Workflow

## Base Workflow
Follow `skills/testing-strategy.md` for general testing principles. This document covers the Node.js-specific testing process using Jest and Supertest.

---

## Testing Flow

```
1. Unit Tests (Services/Utils) → 2. Integration/API Tests (Routes/Controllers)
```

---

## Step 1: Unit Tests (Jest)

**Scope:** Services, Utilities, Custom Errors.
**Goal:** Test business logic in absolute isolation. Do NOT connect to a real database.

### Mocking the Database

If using Constructor Injection (recommended), pass a mock repository to your service.

```typescript
// src/services/user.service.test.ts
import { UserService } from './user.service';
import { ConflictError } from '../errors/AppError';

describe('UserService', () => {
  let userService: UserService;
  let mockRepo: any;

  beforeEach(() => {
    // Create a mock repository
    mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    userService = new UserService(mockRepo);
  });

  it('should throw ConflictError if email exists', async () => {
    // Arrange
    mockRepo.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com' });

    // Act & Assert
    await expect(userService.registerUser({ email: 'test@test.com' }))
      .rejects
      .toThrow(ConflictError);
    
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});
```

---

## Step 2: Integration/API Tests (Supertest)

**Scope:** The full HTTP lifecycle (Router → Middleware → Controller → Service → DB).
**Goal:** Verify that the API accepts the right JSON, modifies the database, and returns the correct HTTP status codes.

### Setup

Use `supertest` to make HTTP requests to your Express app without actually listening on a network port. Use an in-memory database (like SQLite or MongoDB Memory Server) or a dedicated test database (Postgres on Docker).

```typescript
// tests/integration/user.api.test.ts
import request from 'supertest';
import { app } from '../../src/app'; // Import the Express app (not server.ts)
import { prisma } from '../../src/config/db';

describe('POST /api/v1/users', () => {
  
  // Clean DB before each test
  beforeEach(async () => {
    await prisma.user.deleteMany(); 
  });

  it('should create a user and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        email: 'new@user.com',
        password: 'password123',
        name: 'New User'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('new@user.com');
    expect(res.body.data.password).toBeUndefined(); // Ensure password not leaked

    // Verify DB state
    const dbUser = await prisma.user.findUnique({ where: { email: 'new@user.com' } });
    expect(dbUser).not.toBeNull();
  });

  it('should return 400 if validation fails', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'invalid-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

---

## Best Practices

1. **Separate `app.ts` from `server.ts`:** `app.ts` configures Express and exports it. `server.ts` imports `app`, connects to the DB, and calls `app.listen()`. This allows Supertest to use `app` without starting a server on port 3000.
2. **Test Database:** Never run integration tests against your development database. They will wipe your data. Configure Jest to use a `.env.test` file that points to a separate test database.
3. **Database Teardown:** Use `beforeEach` or `afterEach` to truncate tables. Do not rely on tests running in a specific order.

---

## Quality Checklist

- [ ] Services are unit tested in isolation by mocking the Repository/Database layer.
- [ ] API endpoints are integration tested using Supertest to verify HTTP status codes and JSON formats.
- [ ] Integration tests verify the state of the database after a POST/PUT/DELETE request.
- [ ] The test suite cleans the database between runs so tests do not interfere with each other.
- [ ] The Express application is exported from `app.ts` independently of the `app.listen` call.
