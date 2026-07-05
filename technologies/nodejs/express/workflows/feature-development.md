# Node.js Feature Development Workflow

## Base Workflow
Follow `workflows/feature-development.md` as the foundation. This document adds Node.js/Express-specific steps.

---

## Node.js-Specific Steps

### Step 2 (Design) — Backend Additions

**1. Data Modeling:**
- Design the database schema before writing code.
- How will the data be stored? (Tables, Relationships, Indexes)
- Write out the Prisma Schema (`schema.prisma`) or TypeORM entities.

**2. API Contract (REST Design):**
- Define the URL paths, HTTP methods, expected request bodies, and exact response formats.
- Example:
  - `POST /api/v1/orders`
  - Body: `{ productId: string, quantity: number }`
  - Response (201): `{ success: true, data: { orderId: "..." } }`

### Step 3 (Plan) — Node.js Build Order

Build from the bottom (database) up to the top (HTTP routes).

```
1. Database Schema (Update schema.prisma, create migration)
2. Types / Zod Schemas (Define request validation rules)
3. Repository (Write DB access methods)
4. Service (Write business logic, inject repository)
5. Controller (Handle req/res, catch errors, call service)
6. Route (Mount controller to an Express router path)
```

### Step 4 (Implement) — Implementation Checklist

**Data Layer:**
- [ ] Database migration created and run successfully.
- [ ] Repository methods only return data, no HTTP objects.

**Business Layer:**
- [ ] Service methods handle all business validations (e.g., "does user have enough balance?").
- [ ] Custom `AppError`s (like `ConflictError`, `NotFoundError`) are thrown when business rules are violated.

**Transport Layer (Express):**
- [ ] Request validation middleware (Zod) is applied to the route.
- [ ] Authorization middleware (`requireAuth`, `restrictTo`) is applied if the route is protected.
- [ ] Controller method is wrapped in `catchAsync` (or standard try/catch calling `next()`).
- [ ] Controller returns correct HTTP status code (200, 201).

### Step 5 (Verify) — Node.js-Specific Checks

```bash
# 1. Run type checking
tsc --noEmit

# 2. Run unit and integration tests
npm run test

# 3. Test API manually
# Use Postman, Insomnia, or a curl command to verify the endpoint locally.
```

**Security & Error Verification:**
- [ ] Send invalid data (missing fields, wrong types) — Does it return a clean 400?
- [ ] Try without a token (if protected) — Does it return 401?
- [ ] Try with a non-admin token (if restricted) — Does it return 403?
- [ ] Try to fetch an ID that doesn't exist — Does it return 404?

---

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│ NODE.JS FEATURE FLOW                             │
│                                                  │
│ 1. Update Database Schema & Migrate              │
│ 2. Define Validation Schemas (Zod)               │
│ 3. Build Repository (DB queries)                 │
│ 4. Build Service (Business logic)                │
│ 5. Build Controller (HTTP parsing & responses)   │
│ 6. Wire Router (Apply middleware)                │
│ 7. Test endpoint with Postman/Tests              │
└─────────────────────────────────────────────────┘
```
