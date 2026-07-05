# Node.js Documentation Workflow

## Base Workflow
Follow `skills/documentation.md` for general documentation principles. This document adds Node.js/Express specific documentation standards.

---

## Documentation Flow

```
1. API Docs (OpenAPI/Swagger) → 2. Code Docs (TSDoc) → 3. Project Docs (README/ADR)
```

---

## Step 1: API Documentation (OpenAPI/Swagger) — MUST

Backend APIs exist to be consumed. An undocumented API is useless. You MUST provide an OpenAPI (Swagger) specification.

### 1. Generating Docs
Do not write swagger.yaml by hand. Use tools that generate it from your code/schemas.
- If using Zod: Use `@asteasolutions/zod-to-openapi`.
- Alternatively, use `swagger-jsdoc` to write OpenAPI specs in JSDoc comments above routes.

```typescript
/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Creates a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', userController.createUser);
```

### 2. Hosting Docs
Serve the documentation directly from your Express app (e.g., at `/api-docs`) in development and staging environments using `swagger-ui-express`.

---

## Step 2: Code-Level Documentation (TSDoc)

TypeScript uses `/** */` for documentation comments. 

### Documenting Services
Document complex business logic in the Service layer. Controllers usually do not need heavy documentation if they follow standard REST patterns.

```typescript
/**
 * Registers a new user and provisions their initial wallet.
 * 
 * @param data - The user's registration details (validated).
 * @throws {ConflictError} If the email is already in use.
 * @returns The created user object (excluding password hash).
 */
async registerUser(data: CreateUserInput): Promise<UserDto> {
  // ...
}
```

---

## Step 3: Project Documentation (README & ADRs)

A Node.js project's root `README.md` must contain specific setup instructions for other developers.

### Required README Sections

1. **Prerequisites:**
   - Node.js version (e.g., `v20+`)
   - Database requirements (e.g., PostgreSQL 15, Redis)
   - Docker (if using docker-compose for local dev)

2. **Getting Started:**
   ```bash
   # 1. Install dependencies
   npm install

   # 2. Setup environment variables
   cp .env.example .env

   # 3. Spin up local database via Docker
   docker-compose up -d

   # 4. Run database migrations
   npx prisma migrate dev

   # 5. Start development server
   npm run dev
   ```

3. **Available Scripts:**
   List what `npm run dev`, `npm run build`, `npm test`, and `npm run lint` do.

4. **Environment Variables (.env.example):**
   You MUST include a `.env.example` file in the repository showing all required variables (with dummy values).

### Architecture Decision Records (ADRs)

Document major technical choices in `docs/ADRs/`.
Common Node.js topics:
- **Database:** Why PostgreSQL over MongoDB? Why Prisma over TypeORM?
- **Validation:** Why Zod over Joi?
- **Auth:** Why JWT over Session Cookies?

---

## Quality Checklist

- [ ] OpenAPI/Swagger documentation is generated and accessible via a `/api-docs` route.
- [ ] Service methods contain `/** */` TSDoc comments explaining parameters, return values, and potential errors thrown.
- [ ] A `.env.example` file exists and is kept up-to-date with all required environment variables.
- [ ] `README.md` includes explicit instructions for setting up the local database and running migrations.
- [ ] Major technical choices (ORM, Validation library, Auth mechanism) are documented in ADRs.
