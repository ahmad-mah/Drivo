# Data Validation & Sanitization

## 1. Load Conditions
- **Trigger**: Parsing incoming requests (`req.body`, `req.query`, `req.params`).
- **Prerequisites**: `node-express/skills/middleware-pipeline.md`

## 2. Core Directives
- **Zero Trust**: ALL incoming data MUST be validated against a strict schema before hitting the Controller.
- **Middleware Extraction**: Validation MUST occur in middleware, NOT inside Controller business logic.
- **Strip Unknowns**: Schemas MUST strip out unwhitelisted fields (e.g., stopping injection of `isAdmin: true`).

## 3. Implementation Workflow (Using Zod)

### Step 1: Define Schema
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    age: z.coerce.number().optional(), // Coerce string to number
  }).strict(), // Strips unknown fields
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
```

### Step 2: Generic Validation Middleware
```typescript
import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      next(error);
    }
  };
```

### Step 3: Apply to Route
```typescript
// Route
router.post('/', validate(createUserSchema), controller.create);

// Controller
export const create = async (req: Request<{}, {}, CreateUserInput>, res: Response) => {
  // req.body is fully typed and stripped of malicious extra fields
}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Manual `if (!req.body.x)` | Moves validation to Controller, violating Single Responsibility. Use Zod middleware. |
| Trusting `req.params` typing | `req.params.id` is always a string. MUST coerce/validate if expecting a number or UUID. |
| Returning raw Zod/Joi error | Exposes internal schemas. Map to a clean `[{ field, message }]` format. |

## 5. Verification Checklist
- [ ] All POST/PUT routes guarded by validation middleware.
- [ ] Zod schemas enforce `.strict()` or field stripping.
- [ ] Controller methods strongly type `req.body` using `z.infer`.
- [ ] Validation errors return HTTP 400 Bad Request securely.
