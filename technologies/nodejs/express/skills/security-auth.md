# Security & Authentication

## 1. Load Conditions
- **Trigger**: Login/Register flows, route protection, HTTP header hardening, password handling.
- **Prerequisites**: `node-express/skills/middleware-pipeline.md`

## 2. Core Directives
- **Hash Passwords**: NEVER store plain-text passwords. MUST use `bcrypt` (min 10 rounds) or `argon2`.
- **JWT Content**: NEVER store sensitive data (SSN, password) in a JWT. It is signed, NOT encrypted.
- **Hardened Headers**: MUST apply `helmet` and `cors` globally.

## 3. Implementation Workflow

### Step 1: Password Hashing
```typescript
import bcrypt from 'bcrypt';
export const hashPassword = (pass: string) => bcrypt.hash(pass, 12);
export const verifyPassword = (pass: string, hash: string) => bcrypt.compare(pass, hash);
```

### Step 2: JWT Generation
```typescript
import jwt from 'jsonwebtoken';
export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};
```

### Step 3: Route Protection Middleware
```typescript
import { UnauthorizedError } from '../errors/AppError';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new UnauthorizedError('Log in required'));

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch {
    return next(new UnauthorizedError('Invalid token'));
  }
};
```

### Step 4: RBAC (Role-Based Access)
```typescript
export const restrictTo = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ForbiddenError('Insufficient permissions'));
  }
  next();
};

// Usage: router.delete('/:id', requireAuth, restrictTo('admin'), deleteUser);
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Missing Rate Limiting | Attackers brute-force `/login`. MUST apply `express-rate-limit` to Auth endpoints. |
| Trusting client Payload | Client sends `req.body.role = admin`. ONLY trust `req.user.role` from the verified JWT. |
| Storing JWT in LocalStorage | Vulnerable to XSS. For web clients, use `HttpOnly` cookies. |

## 5. Verification Checklist
- [ ] Passwords hashed via `bcrypt`/`argon2`.
- [ ] Routes protected via `requireAuth` middleware.
- [ ] JWT payloads verified and extracted to `req.user`.
- [ ] Rate limiting applied to login/registration endpoints.
- [ ] Helmet middleware active.
