# Middleware Pipeline

## 1. Load Conditions
- **Trigger**: Intercepting requests (Auth, logging), establishing global error handling, controlling execution order.
- **Prerequisites**: `node-express/rules/node-idioms.md`

## 2. Core Directives
- **Execution Order**: Middleware runs left-to-right, top-to-bottom. Order is CRITICAL. Global middleware → Routes → 404 Handler → Global Error Handler.
- **Fail Fast**: Security, Rate Limiting, and CORS MUST be mounted before any routes or body parsers.
- **Terminate or Pass**: Every middleware MUST either call `next()` to continue, or send a response to terminate.

## 3. Implementation Workflow

### Step 1: Global Pipeline (app.ts)
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

app.use(helmet()); // 1. Security Headers
app.use(cors());   // 2. CORS
app.use(express.json({ limit: '10kb' })); // 3. Body Parser
// 4. Routes go here...
```

### Step 2: Custom Middleware
Extend the `Request` object safely via TS declaration merging.
```typescript
declare global {
  namespace Express {
    interface Request { user?: { id: string, role: string }; }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' }); // Terminates execution
  }
  
  req.user = verifyToken(token); // Attach data
  next(); // Passes to next middleware/controller
};
```

### Step 3: Global Error Handler
MUST have exactly 4 parameters. MUST be mounted LAST.
```typescript
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
};
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Hanging Request | Forgot to call `next()` or `res.send()`. Add `next()`. |
| Headers Already Sent | Called `next()` AFTER `res.send()`. MUST use `return res.send()` or `return next(err)`. |
| Error Handler Unreachable | Mounted `globalErrorHandler` before `app.use('/routes')`. Move it to the absolute bottom of `app.ts`. |

## 5. Verification Checklist
- [ ] Global middleware (Helmet, CORS) placed at the top.
- [ ] Error handler `(err, req, res, next)` placed at the bottom.
- [ ] `next()` or `res.send()` called in every logical branch.
- [ ] `req.user` types extended safely via `declare global`.
