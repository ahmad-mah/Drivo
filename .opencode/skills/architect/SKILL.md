---
name: architect
description: Use when designing the project structure, module boundaries, data flow, or directory organization for a new or existing repository.
---

# Skill: Architect

This skill provides guidelines for designing system architecture, project layouts, and module boundaries.

## Rules
1. **Clean Architecture by Default**: Separate code into three layers:
   - **Domain**: Pure business entities, use cases, and repository interfaces (zero framework imports).
   - **Data**: API clients, database providers, local storage implementations for repository interfaces.
   - **Presentation**: UI components, screen layouts, state hooks (React Native) or widgets (Flutter).
2. **Feature-First Directory Layout**: Organize files by feature/module name, not by file type (e.g. `auth/`, `expenses/`, `settings/`). Within each feature, follow the three-layer structure.
3. **API Boundaries**: Keep database schemas, network DTOs, and view models independent. Map between them in the data layer.
4. **Dependency Direction**: Domain layer must never know about presentation or data frameworks. Data layer depends on domain interfaces. Presentation depends on domain entities.

## Workflow
1. **Identify Boundaries**: List the core business domains (e.g. Auth, Expenses, Categories, Budgets).
2. **Define Interfaces**: Create repository contracts and use-case classes in the domain layer.
3. **Implement Data Adapters**: Write API clients, database services, and local storage in the data layer that conform to domain contracts.
4. **Wire Up Presentation**: Create screens and components consuming use-cases via dependency injection.

## Checklists
- [ ] Domain layer is pure and framework-independent.
- [ ] Feature directories follow consistent naming and structure.
- [ ] Dependency injection is configured for all domain/data bindings.
- [ ] No circular imports or dependency cycles exist.
- [ ] Repository pattern is used for all external data sources.

## Common Mistakes
- **Leaking Framework Imports**: Importing React Native or Flutter APIs inside the domain layer.
- **God Modules**: Creating a single catch-all service that does networking, caching, alerts, and navigation.
- **Flat Directory Layout**: Dumping all files into `/screens`, `/services`, or `/components` without domain segmentation.

## Validation Steps
1. Run `npx madge` or similar to verify no circular dependencies between domain/data/presentation layers.
2. Confirm domain modules contain no UI framework imports.
3. Review dependency injection wiring is correct for all modules.
