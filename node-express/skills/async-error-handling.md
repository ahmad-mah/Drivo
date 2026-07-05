# Async & Error Handling

## 1. Load Conditions
- **Trigger**: Writing async routes, handling Promise rejections, throwing custom HTTP errors.
- **Prerequisites**: `node-express/skills/middleware-pipeline.md`

## 2. Core Directives
- **Never Drop Errors**: Async routes MUST NEVER leave rejected promises unhandled (crashes Node process).
- **Custom Error Classes**: MUST use custom Error classes with `statusCode` properties for operational errors (400, 401, 404).
- **No Stack Traces in Prod**: Global error handlers MUST NOT expose `err.stack` to clients in production.

## 3. Implementation Workflow

### Step 1: The Async Wrapper (Express < 5.x)
Avoid `try/catch` hell by wrapping async controllers.
```typescript
import { Request, Response, NextFunction } from 'express';

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Usage:
export const getUser = catchAsync(async (req, res, next) => {
  const user = await db.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.json(user);
});
```

### Step 2: Custom Application Errors
```typescript
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Safe to show client
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(msg = 'Not found') { super(msg, 404); }
}
```

### Step 3: Failsafe Listeners (server.ts)
Catch catastrophic background failures.
```typescript
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  process.exit(1);
});
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Throwing inside raw async route | Express ignores it. Process crashes. MUST use `catchAsync` or `try/catch(next)`. |
| `res.status(500).send(err)` in controller | Bypasses global logic. Violates DRY. Throw error and let global handler manage it. |
| `process.exit(1)` inside a route | Kills server for ALL active users. Only use on fatal startup errors. |

## 5. Verification Checklist
- [ ] All async controllers wrapped in `catchAsync` or `try/catch`.
- [ ] Custom `AppError` subclasses used for HTTP 4xx responses.
- [ ] Global error handler strips stack traces in `NODE_ENV=production`.
- [ ] Global `unhandledRejection` listener implemented.
