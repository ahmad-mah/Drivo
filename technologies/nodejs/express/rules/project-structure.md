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

---

## Modular Structure Quick Start (Recommended)

For new projects, use this modular structure where each feature is a self-contained module:

```
backend/
├── src/
│   ├── app.ts                  # Express app setup, middleware, route wiring
│   ├── server.ts               # Entry point (listen, DB connect, graceful shutdown)
│   ├── config/
│   │   ├── env.ts              # Environment variables (validated with Zod)
│   │   ├── database.ts         # Prisma client singleton
│   │   └── index.ts            # Barrel export
│   ├── errors/
│   │   └── AppError.ts         # Custom error class
│   ├── middleware/
│   │   ├── error.middleware.ts  # Centralized error handler
│   │   ├── validate.middleware.ts # Zod validation middleware
│   │   └── auth.middleware.ts   # Authentication guard
│   ├── types/
│   │   └── index.ts            # Shared types
│   ├── modules/
│   │   ├── users/              # Example module
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.schema.ts
│   │   │   └── user.types.ts
│   │   └── webhook/            # Example module
│   │       ├── webhook.routes.ts
│   │       ├── webhook.controller.ts
│   │       ├── webhook.service.ts
│   │       ├── webhook.schema.ts
│   │       └── webhook.types.ts
│   └── utils/
├── prisma/
│   └── schema.prisma
├── tests/
├── .env.example
├── package.json                # With "type": "module"
├── tsconfig.json               # ESNext module, bundler resolution
└── nodemon.json
```

### Quick Setup Commands
```bash
mkdir -p src/{config,errors,middleware,types,modules,utils} prisma tests
npm init -y
npm install express @prisma/client cors dotenv helmet morgan zod
npm install -D typescript @types/express @types/node @types/cors @types/morgan prisma tsx nodemon
npx prisma init
```

### tsconfig.json Template
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### package.json Scripts
```json
"scripts": {
  "dev": "nodemon",
  "build": "tsc",
  "start": "node dist/server.js",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "typecheck": "tsc --noEmit"
}
```

---

## Webhook Handler Map Pattern — RECOMMENDED

Instead of a switch statement, use a handler map. Each event type gets its own function — easy to test, easy to extend, no growing switch.

```typescript
const handlers: Record<string, (event: WebhookEvent) => Promise<void>> = {
  "user.created": async (event) => { /* ... */ },
  "user.updated": async (event) => { /* ... */ },
  "user.deleted": async (event) => { /* ... */ },
};

async function processWebhook(event: WebhookEvent): Promise<void> {
  const handler = handlers[event.type];
  if (handler) {
    await handler(event);
  }
}
```

**Benefits:**
- One function per event — isolated and testable.
- New events = new entry in the map, no structural changes.
- Handler can be moved to a separate file when the module grows.

---

## Error Handling Architecture — MUST

Five layers of error handling in every production Express app:

### 1. Custom Error Classes
```
src/errors/
├── AppError.ts              # Base class (statusCode, isOperational)
├── BadRequestError.ts       # 400
├── UnauthorizedError.ts     # 401
├── ForbiddenError.ts        # 403
├── NotFoundError.ts         # 404
├── ConflictError.ts         # 409
├── ValidationError.ts       # 400 with field-level errors
└── InternalServerError.ts   # 500 (non-operational)
```

### 2. Express Error Middleware
```typescript
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ success: false, message: err.message, errors: err.errors });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});
```

### 3. 404 Handler
```typescript
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
```

### 4. Process-Level Handlers — `server.ts`
```typescript
process.on("unhandledRejection", (reason) => {
  console.error(reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error(err);
  process.exit(1);
});
```

### 5. Response Code Rules
| Situation | Code |
|---|---|
| Signature invalid | 400 |
| Validation error | 400 |
| Authenticated but denied | 403 |
| Resource not found | 404 |
| Conflict (duplicate) | 409 |
| Bug in code | 500 |
| Success | 200 |
| Unknown webhook event | 200 |
