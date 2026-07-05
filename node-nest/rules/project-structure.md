# Project Structure Rules

## Purpose

Defines how a modern NestJS application should be organized. NestJS strongly enforces an Angular-inspired, feature-first module architecture.

---

## Feature-First Architecture — MUST

Code MUST be grouped by **Feature** (Domain), not by technical layer (e.g., all controllers in one folder, all services in another).

### Standard Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Entry point
├── config/                    # Global configurations (DB, env)
├── common/                    # Shared code (cross-feature)
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── users/                     # Feature: Users
│   ├── dto/                   # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/              # DB Entities (TypeORM/Prisma schema)
│   │   └── user.entity.ts
│   ├── users.controller.ts    # HTTP layer
│   ├── users.module.ts        # Module encapsulation
│   └── users.service.ts       # Business logic
└── orders/                    # Feature: Orders
    ├── dto/
    ├── entities/
    ├── orders.controller.ts
    ├── orders.module.ts
    └── orders.service.ts
```

### Rule: Module Encapsulation
A feature directory (e.g., `users/`) should be self-contained. If `orders` needs something from `users`, the `OrdersModule` MUST import `UsersModule`. Do NOT bypass the module system by importing the `UsersService` directly.

---

## Shared Resources (`common/`) — MUST

Any code that is used by multiple features and does not belong to a specific domain MUST be placed in a `src/common/` folder.

- **Guards:** e.g., `jwt-auth.guard.ts`
- **Decorators:** e.g., `current-user.decorator.ts`
- **Filters:** e.g., `http-exception.filter.ts`
- **Interceptors:** e.g., `logging.interceptor.ts`

---

## Monorepo Architecture (Advanced)

If building microservices or sharing code between multiple NestJS apps, use the NestJS Workspace (Monorepo) structure.

```
my-workspace/
├── nest-cli.json
├── package.json
├── apps/
│   ├── api-gateway/       # Main public API
│   │   └── src/
│   └── billing-service/   # Microservice
│       └── src/
└── libs/
    └── database/          # Shared library
        └── src/
```
*Run `nest generate app` or `nest generate library` to manage this.*

---

## Quality Checklist

- [ ] Code is organized strictly into Feature Modules (`users/`, `orders/`).
- [ ] `app.module.ts` acts only as a root orchestrator, importing feature modules.
- [ ] No feature code imports a Service from another feature without importing its Module.
- [ ] Cross-cutting concerns (Guards, Interceptors, Decorators) are placed in a `common/` directory.
- [ ] DTOs and Entities are kept inside their respective feature directories.
