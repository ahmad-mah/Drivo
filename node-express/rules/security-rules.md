# Security Rules

## Purpose

Enforceable rules to harden an Express.js application against common web vulnerabilities (OWASP Top 10).

---

## Must-Have Security Middleware — MUST

### 1. HTTP Headers (Helmet)
You MUST use the `helmet` package to automatically set secure HTTP headers (X-XSS-Protection, Strict-Transport-Security, X-Frame-Options, etc.).

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 2. Rate Limiting
You MUST apply rate limiting to prevent brute force and DDoS attacks, especially on authentication endpoints.

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 requests per IP
  message: 'Too many login attempts, please try again later'
});

app.use('/api/v1/auth/login', authLimiter);
```

### 3. Body Size Limits
You MUST limit the size of the incoming request body to prevent attackers from crashing the server by sending massive payloads.

```typescript
app.use(express.json({ limit: '10kb' }));
```

---

## Data Security — MUST

### 4. Parameter Pollution Prevention
Attackers may send multiple query parameters with the same name (e.g., `?sort=name&sort=age`) to crash the server or bypass logic. Use `hpp` to prevent this.

```typescript
import hpp from 'hpp';
app.use(hpp());
```

### 5. No SQL/NoSQL Injection
You MUST NOT construct database queries using string concatenation with user input.
- **SQL:** Use parameterized queries or an ORM (Prisma/TypeORM).
- **MongoDB:** Use `express-mongo-sanitize` to remove `$` and `.` operators from `req.body`, `req.query`, and `req.params`.

```typescript
// VIOLATION (SQL Injection risk)
db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

// CORRECT
db.query('SELECT * FROM users WHERE email = ?', [req.body.email]);
```

### 6. Do Not Leak System Errors
You MUST NOT expose the `err.stack` or raw database errors to the client in production. Your global error handler must strip these out.

```typescript
res.status(500).json({
  error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  stack: process.env.NODE_ENV === 'production' ? null : err.stack
});
```

---

## Authentication Security — MUST

### 7. Secure Password Storage
You MUST hash passwords using `bcrypt` (min 10 rounds) or `argon2`. You MUST NOT use `md5` or `sha256`.

### 8. JWT Security
- JWTs MUST NOT contain sensitive data (passwords, social security numbers).
- JWTs MUST have an expiration time (`expiresIn`).
- If storing JWTs in cookies, the cookies MUST be `HttpOnly` and `Secure` (in production).

---

## Quality Checklist

- [ ] `helmet` is installed and mounted.
- [ ] `express-rate-limit` is applied to the API, and strictly to login/reset routes.
- [ ] `express.json` is configured with a strict `limit` (e.g., `'10kb'`).
- [ ] `hpp` is used to prevent parameter pollution.
- [ ] Database queries are parameterized (no string concatenation with user input).
- [ ] Stack traces and raw DB errors are hidden in production environments.
- [ ] Passwords are hashed using `bcrypt` or `argon2`.
