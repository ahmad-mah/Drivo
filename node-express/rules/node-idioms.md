# Node.js Idioms & TypeScript Rules

## Purpose

Rules for writing idiomatic, modern Node.js backend code using TypeScript. These rules prevent common bugs related to the event loop, unhandled promises, and typing issues.

---

## Language Rules

### 1. No Synchronous Blocking Methods — MUST (Blocking)

Node.js runs on a single-threaded event loop. Using synchronous methods (e.g., `fs.readFileSync`, `crypto.pbkdf2Sync`) blocks the thread for ALL users. 

```typescript
// VIOLATION — Blocks the server! No other requests will be processed.
import fs from 'fs';
app.get('/file', (req, res) => {
  const data = fs.readFileSync('/large-file.json'); 
  res.send(data);
});

// CORRECT — Non-blocking async
import fs from 'fs/promises';
app.get('/file', async (req, res) => {
  const data = await fs.readFile('/large-file.json');
  res.send(data);
});
```

### 2. Await All Promises — MUST

Never leave a dangling promise unhandled. It causes race conditions, unexpected execution orders, and unhandled rejections that crash the server.

```typescript
// VIOLATION — Database save happens in the background, errors are swallowed
const createUser = (req, res) => {
  db.save(req.body); // Missing await
  res.status(201).send('Created');
}

// CORRECT
const createUser = async (req, res) => {
  await db.save(req.body); 
  res.status(201).send('Created');
}
```

### 3. Use `Promise.all` for Concurrent Operations — SHOULD

If you have multiple asynchronous operations that do not depend on each other, do not run them sequentially.

```typescript
// NOT RECOMMENDED — Sequential (takes 2 seconds total)
const user = await db.getUser(id);       // takes 1s
const posts = await db.getPosts(id);     // takes 1s

// RECOMMENDED — Concurrent (takes 1 second total)
const [user, posts] = await Promise.all([
  db.getUser(id),
  db.getPosts(id)
]);
```

### 4. Strict TypeScript Typing — MUST

Never use `any`. Always type your function parameters, returns, and variables.

```typescript
// VIOLATION
const processData = (data: any) => { ... }

// CORRECT
interface UserPayload {
  email: string;
  age: number;
}
const processData = (data: UserPayload): void => { ... }
```

### 5. ES Modules syntax over CommonJS — SHOULD

Modern Node.js projects should use ES Modules (`import`/`export`) instead of CommonJS (`require`/`module.exports`). Ensure `tsconfig.json` and `package.json` (`"type": "module"`) are configured properly.

```typescript
// NOT RECOMMENDED
const express = require('express');
module.exports = router;

// RECOMMENDED
import express from 'express';
export default router;
```

---

## Environment Variables

### 6. Validate Environment Variables on Startup — MUST

Failing to provide a required environment variable (e.g., `JWT_SECRET` or `DATABASE_URL`) should crash the app immediately on startup, not hours later when a specific route is hit.

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// This will throw and crash the server if variables are missing
export const env = envSchema.parse(process.env);
```

---

## Quality Checklist

- [ ] Zero synchronous standard library methods (e.g., `*Sync`) used in the request lifecycle.
- [ ] All database calls, network requests, and file operations use `await`.
- [ ] Independent async operations use `Promise.all` to run concurrently.
- [ ] Environment variables are strictly validated on app startup.
- [ ] No `any` types are used; all data structures are strictly typed.
- [ ] ES Modules (`import/export`) are used consistently (no `require`).
