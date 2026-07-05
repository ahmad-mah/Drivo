# NestJS Feature Development Workflow

## Base Workflow
Follow `workflows/feature-development.md` as the foundation. This document adds NestJS-specific steps.

---

## NestJS-Specific Steps

### Step 2 (Design) — Backend Additions

**1. Data Modeling:**
- Update your `schema.prisma` or create TypeORM Entity classes (`.entity.ts`).

**2. Module Boundaries:**
- Does this feature belong in an existing module, or should it be a new Module? 
- What services will it need from other modules? (Determine imports).
- What services will it provide to other modules? (Determine exports).

### Step 3 (Plan & Scaffold) — The Nest CLI

You MUST use the Nest CLI to generate files. This automatically wires them into the `AppModule` and prevents typo-related DI errors.

```bash
# Example: Creating a new 'orders' feature

# 1. Generate the module
npx nest g module orders

# 2. Generate the service (business logic)
npx nest g service orders

# 3. Generate the controller (HTTP routes)
npx nest g controller orders

# (Alternative) Generate full CRUD boilerplate
npx nest g resource orders
```

### Step 4 (Implement) — Implementation Checklist

**Data Layer (Entities/DTOs):**
- [ ] DTOs are created using `class` and decorated with `class-validator` rules.
- [ ] Return DTOs (or Entities) are decorated with `@Exclude()` to hide sensitive fields if needed.

**Business Layer (Service):**
- [ ] Database repository/client is injected via constructor.
- [ ] Service handles business rules and throws appropriate `HttpException`s (e.g., `NotFoundException`) on failure.

**Transport Layer (Controller):**
- [ ] Endpoint is decorated with appropriate HTTP method (`@Get`, `@Post`).
- [ ] Request payloads are extracted using decorators (`@Body()`, `@Param()`).
- [ ] Authentication/Authorization is enforced using `@UseGuards()`.
- [ ] Swagger decorators (`@ApiTags`, `@ApiResponse`) are added (if using OpenAPI).

### Step 5 (Verify) — NestJS-Specific Checks

```bash
# 1. Run type checking and build
npm run build

# 2. Run unit tests
npm run test

# 3. Run E2E tests (crucial for verifying Guards and Pipes)
npm run test:e2e
```

**Security & Flow Verification:**
- [ ] Does the Global `ValidationPipe` successfully block invalid POST data?
- [ ] Does the Auth Guard successfully block unauthenticated requests?
- [ ] Is the module correctly exporting its Service if another module requires it?

---

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│ NESTJS FEATURE FLOW                              │
│                                                  │
│ 1. `nest g module/service/controller`            │
│ 2. Define Entities/Prisma Schema                 │
│ 3. Define DTOs with class-validator              │
│ 4. Build Service (Business logic)                │
│ 5. Build Controller (Route decorators)           │
│ 6. Apply Guards/Interceptors                     │
│ 7. Write Unit and E2E Tests                      │
└─────────────────────────────────────────────────┘
```
