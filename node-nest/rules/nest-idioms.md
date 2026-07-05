# NestJS Idioms & Rules

## Purpose

Rules for writing idiomatic, modern NestJS code using TypeScript. NestJS is highly opinionated, relying heavily on Decorators, Reflection (Metadata), and Dependency Injection.

---

## Architecture Idioms

### 1. Framework Agnosticism — MUST

NestJS can run on top of Express (default) or Fastify (for high performance). You MUST write your code in a way that allows swapping the underlying platform without changing business logic.

- **Do NOT** use `@Req()` and `@Res()` decorators unless absolutely necessary (e.g., file downloads).
- **Use** `@Body()`, `@Query()`, `@Param()`, and let Nest handle the response.

```typescript
// VIOLATION — Tied to Express
@Get()
findAll(@Req() req: Request, @Res() res: Response) {
  res.status(200).json([]);
}

// CORRECT — Framework Agnostic
@Get()
findAll() {
  return []; // Nest automatically sends 200 OK
}
```

### 2. Constructor Dependency Injection — MUST

You MUST NOT instantiate classes manually if they are Providers.

```typescript
// VIOLATION
export class UsersController {
  private usersService = new UsersService();
}

// CORRECT
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

### 3. Throw HttpExceptions — MUST

Do not throw generic JavaScript `Error` objects in Services/Controllers unless it is a fatal system error. Use Nest's built-in HTTP Exceptions.

```typescript
// VIOLATION
if (!user) throw new Error('User not found'); // Returns 500

// CORRECT
import { NotFoundException } from '@nestjs/common';
if (!user) throw new NotFoundException('User not found'); // Returns 404
```

---

## RxJS and Async Code

### 4. Promises vs Observables — SHOULD

NestJS heavily uses RxJS internally (Interceptors, Microservices). However, for standard HTTP REST/GraphQL endpoints, `async/await` and Promises are preferred for readability.

- **Use `async/await`** for database calls, file I/O, and external HTTP requests.
- **Use RxJS Observables** in Interceptors or when listening to streams of events (Microservices, WebSockets).

```typescript
// Standard async is preferred for business logic
async createUser(dto: CreateUserDto): Promise<User> {
  return await this.usersRepository.save(dto);
}
```

---

## Naming Conventions — MUST

NestJS enforces a strict naming convention based on the file type.

| Element         | File Name Convention       | Class Name Convention  | Example                   |
| --------------- | -------------------------- | ---------------------- | ------------------------- |
| Module          | `feature.module.ts`        | `FeatureModule`        | `users.module.ts`         |
| Controller      | `feature.controller.ts`    | `FeatureController`    | `users.controller.ts`     |
| Service         | `feature.service.ts`       | `FeatureService`       | `users.service.ts`        |
| DTO             | `action-feature.dto.ts`    | `ActionFeatureDto`     | `create-user.dto.ts`      |
| Entity          | `feature.entity.ts`        | `Feature`              | `user.entity.ts`          |
| Guard           | `name.guard.ts`            | `NameGuard`            | `jwt-auth.guard.ts`       |
| Interceptor     | `name.interceptor.ts`      | `NameInterceptor`      | `transform.interceptor.ts`|

---

## Quality Checklist

- [ ] `@Req()` and `@Res()` are avoided to maintain platform independence.
- [ ] Dependencies are exclusively injected via the constructor using `readonly`.
- [ ] Framework-provided exceptions (e.g., `BadRequestException`) are thrown instead of generic Errors.
- [ ] File names strictly follow the `.module.ts`, `.controller.ts`, `.service.ts` convention.
- [ ] Standard `async/await` is used for typical REST API interactions, reserving RxJS for complex streams or interceptors.
