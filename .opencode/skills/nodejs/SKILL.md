---
name: nodejs
description: Use when building Node.js backend features, Express routes, NestJS modules, or Node.js TypeScript code.
---

# Skill: Node.js

This skill provides standards for Node.js backend development using Express and NestJS with TypeScript.

## Rules
1. **TypeScript Over JavaScript**: All backend code must be written in TypeScript. Use strict mode with `strict: true` in `tsconfig.json`.
2. **Express (Current Default)**: The project uses Express with ESM (`"type": "module"` in `package.json`). Use `import`/`export` syntax. Group routes in dedicated router files.
3. **NestJS (Future Default)**: When migrating to NestJS, follow modular architecture: each feature gets its own module with controller, service, and DTOs. Use constructor-based dependency injection.
4. **Dependency Injection**: Prefer explicit DI patterns (NestJS DI or simple constructor injection over global singletons or `require` caching).
5. **Error Handling**: Use centralized error-handling middleware for Express or NestJS exception filters. Never catch errors silently without logging.

## Workflow
1. **Define DTOs/Interfaces**: Create TypeScript interfaces or classes for request/response shapes.
2. **Create Router/Controller**: Map HTTP routes to handler functions.
3. **Add Service Layer**: Place business logic in service classes, not in route handlers.
4. **Add Validation**: Use `zod` or `class-validator` for runtime request validation.
5. **Write Integration Tests**: Test endpoints with `supertest` + `jest`.

## Checklists
- [ ] All route handlers have typed request/response.
- [ ] Error handling middleware/filter is in place.
- [ ] Input validation is applied to all mutation endpoints.
- [ ] Environment variables are typed and validated (e.g. `dotenv` + `zod`).
- [ ] CORS is configured properly for the frontend origin.

## Common Mistakes
- **Unvalidated Input**: Trusting that request bodies, query params, and path params are correctly typed without runtime validation.
- **Blocking the Event Loop**: Performing CPU-heavy operations (hashing, file processing) synchronously in request handlers. Use `worker_threads` or offload.
- **Missing Try/Catch in Async Handlers**: Express does not catch promise rejections automatically without a wrapper like `express-async-errors`.

## Validation Steps
1. Run TypeScript compilation (`npx tsc --noEmit`) and verify zero errors.
2. Run `npm test` or `jest` and ensure tests pass.
3. Test endpoints manually via curl/Postman or integration test suite.
