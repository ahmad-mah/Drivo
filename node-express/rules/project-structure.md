# Project Structure Rules

## Purpose

Defines how a modern Node.js/Express project should be organized. This architecture ensures the separation of concerns, making the app scalable, testable, and maintainable.

---

## The Layered Architecture (N-Tier) — MUST

Your application must separate HTTP transport logic from business logic, and business logic from database access.

### 1. Controllers (The Transport Layer)
- **Role:** Handle HTTP requests and responses.
- **Rules:** Extract data from `req`, pass it to a Service, and send the result via `res`. NO business logic. NO database queries.

### 2. Services (The Business Logic Layer)
- **Role:** Execute business rules (e.g., validating passwords, calculating totals).
- **Rules:** NO knowledge of HTTP (`req`, `res`). Can be called by Controllers, Cron jobs, or CLI scripts.

### 3. Repositories / Models (The Data Layer)
- **Role:** Interact with the database (SQL/NoSQL).
- **Rules:** Execute queries and return plain objects. NO business logic.

---

## Standard Directory Structure

```
my-api/
├── src/
│   ├── app.ts                  # Express app setup (middlewares, routes)
│   ├── server.ts               # Server entry point (app.listen, DB connect)
│   ├── config/                 # Environment and DB config (db.ts, env.ts)
│   ├── routes/                 # Express router definitions (user.routes.ts)
│   ├── controllers/            # Route handlers (user.controller.ts)
│   ├── services/               # Business logic (user.service.ts)
│   ├── repositories/           # DB access (user.repository.ts)
│   ├── middleware/             # Express middlewares (auth, validate)
│   ├── schemas/                # Zod/Joi validation schemas
│   ├── errors/                 # Custom error classes (AppError.ts)
│   ├── utils/                  # Pure helper functions
│   └── types/                  # Global TS interfaces
├── prisma/                     # Database schema/migrations (if using Prisma)
├── tests/                      # Jest tests
├── .env                        # Environment variables (NOT committed)
├── package.json
└── tsconfig.json
```

---

## Dependency Injection (Soft Rule) — SHOULD

To make testing easier, Services should accept Repositories via their constructor, rather than instantiating them directly or using globals.

```typescript
// NOT RECOMMENDED — Hardcoded dependency
export class UserService {
  private userRepo = new UserRepository(); // Hard to mock in tests
}

// RECOMMENDED — Constructor Injection
export class UserService {
  constructor(private userRepo: UserRepository) {}
}

// In the controller:
const userService = new UserService(new UserRepository());
```

---

## File Naming Conventions — MUST

| File Type                | Convention                   | Example                           |
| ------------------------ | ---------------------------- | --------------------------------- |
| Routes                   | `name.routes.ts`             | `user.routes.ts`                  |
| Controllers              | `name.controller.ts`         | `user.controller.ts`              |
| Services                 | `name.service.ts`            | `auth.service.ts`                 |
| Repositories             | `name.repository.ts`         | `order.repository.ts`             |
| Middleware               | `name.middleware.ts`         | `auth.middleware.ts`              |
| Schemas                  | `name.schema.ts`             | `user.schema.ts`                  |

Use `camelCase` or `kebab-case` consistently.

---

## Quality Checklist

- [ ] HTTP concerns (`req`, `res`) are completely absent from the `services/` directory.
- [ ] Database queries (SQL, Prisma, Mongoose) are isolated in the `repositories/` directory.
- [ ] Controllers act only as traffic cops, delegating work to services.
- [ ] File names follow the `.routes.ts`, `.controller.ts`, `.service.ts` postfix convention.
- [ ] The `server.ts` file only handles starting the server and connecting to the DB, while `app.ts` handles Express setup (easier for integration testing).
