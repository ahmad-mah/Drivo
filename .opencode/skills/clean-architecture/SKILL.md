---
name: clean-architecture
description: Use when designing layer boundaries, decoupling business logic from infrastructure, or organizing code into domain/data/presentation layers.
---

# Skill: Clean Architecture

This skill defines the three-layer architecture used across all targets (React Native, Flutter, Node.js backend).

## Layer Structure

```
┌──────────────────────────────┐
│       Presentation            │  UI components, screens, state hooks
│  (React components / Widgets) │  depends on Domain only
├──────────────────────────────┤
│          Data                 │  API clients, DB providers, local storage
│  (Repositories, DTOs, Mappers)│  implements Domain interfaces
├──────────────────────────────┤
│          Domain               │  Entities, Use Cases, Repository interfaces
│  (Pure logic, no frameworks)  │  depends on nothing external
└──────────────────────────────┘
```

## Rules
1. **Domain Layer Purity**: Domain layer must contain zero imports from UI frameworks (React, Flutter), HTTP libraries (axios, fetch), or database drivers. It contains only plain TypeScript/Dart classes, interfaces, and functions.
2. **Repository Inversion**: Define repository interfaces in domain. Implement them in data. Presentation creates instances of data-layer implementations and injects them into domain use-cases.
3. **DTO ↔ Entity Mapping**: Network DTOs and database models must never leak into domain or presentation layers. Map them to domain entities in the data layer.
4. **Use Cases Represent User Intent**: Each use case (e.g. `CreateExpenseUseCase`, `GetExpenseSummaryUseCase`) encapsulates a single business operation. Use cases do not directly import API clients or database connections.

## Workflow
1. **Define Domain Entities**: Create plain classes/interfaces for core business models (e.g. `Expense`, `Category`, `User`).
2. **Define Repository Interfaces**: Declare abstract methods for data access (e.g. `ExpenseRepository.getByDateRange(start, end): Promise<Expense[]>`).
3. **Define Use Cases**: Implement business logic using repository interfaces (injected).
4. **Implement Data Layer**: Write concrete repositories (e.g. `ApiExpenseRepository`, `SqliteExpenseRepository`) that implement domain interfaces.
5. **Configure DI**: Wire the concrete implementations to the use cases at the composition root.
6. **Build Presentation**: Use cases are consumed by view-models/hooks/controllers, which serve UI components.

## Checklists
- [ ] Domain has zero external dependencies (no UI/network imports).
- [ ] Repository interfaces are defined in domain, implementations in data.
- [ ] DTOs are mapped to domain entities before crossing layers.
- [ ] Use cases are injectable and testable (no static/singleton access to data).
- [ ] Data layer handles errors and maps them to domain-level error types.

## Common Mistakes
- **Anemic Domain Layer**: Only putting data types in domain without any business logic. Use cases and validation should live in domain.
- **Leaking ORM Entities**: Passing Sequelize/Prisma/TypeORM entity objects (which have save/delete methods) from data directly to presentation.
- **Circular Dependencies**: Domain importing from data or presentation, breaking the dependency rule.

## Validation Steps
1. Run a dependency cruiser like `madge` to confirm no domain imports from data/presentation.
2. Review use cases: ensure they do not import HTTP, DB, or UI modules.
3. Verify that swapping data layer (e.g. REST → GraphQL or SQLite → PostgreSQL) would require zero changes in domain or presentation.
