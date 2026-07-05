# NestJS Refactoring Workflow

## Base Workflow
Follow `workflows/refactoring.md` as the foundation. This document adds NestJS-specific refactoring patterns.

---

## Common NestJS Refactorings

### 1. Extracting Business Logic from Controllers

**When:** A controller method contains raw database calls, loops, or complex if/else trees.

**Steps:**
1. Identify the logic that does not relate to HTTP parsing.
2. Move this logic into the corresponding Service method.
3. If the controller was throwing standard Errors, update the service to throw `HttpException` subclasses (e.g., `BadRequestException`).
4. Keep the controller strictly focused on decorators (`@Body`, `@Param`) and calling the service.

### 2. Breaking Up the "God Module"

**When:** `AppModule` contains 10 controllers and 20 providers.

**Steps:**
1. Group related controllers and services into logical domains (e.g., `Users`, `Products`).
2. Run `nest g module <name>` to create separate modules.
3. Move the controllers and providers into these specific feature modules.
4. Export the specific services if other modules need them.
5. In `AppModule`, keep the `controllers` and `providers` arrays empty, and only put the new feature modules in the `imports` array.

### 3. Extracting Reusable Logic to Interceptors/Filters

**When:** Every controller method has a massive `try/catch` block or manually formats `{ success: true, data }`.

**Steps:**
1. Remove `try/catch` blocks from controllers. Throw `HttpException`s from the service.
2. Rely on the Global Exception Filter to format the error response.
3. To format successful responses, create a Transform Interceptor and apply it globally in `main.ts` or via `APP_INTERCEPTOR`.

### 4. Moving Manual Validation to DTOs

**When:** Controllers have manual `if (!dto.email.includes('@'))` checks.

**Steps:**
1. Ensure the global `ValidationPipe` is active.
2. Move all validation rules into the DTO class using `class-validator` decorators (e.g., `@IsEmail()`).
3. Remove the manual checks from the controller entirely.

---

## NestJS-Specific Safety Rules

1. **Verify DI Context:** When moving a Service to a new Module, ensure you update the `exports` array if other modules depend on it, otherwise the app will crash on startup.
2. **Watch for Circular Dependencies:** When splitting code into multiple modules, ensure you don't create a situation where Module A imports B, and B imports A. If this happens, extract the shared code into Module C.
3. **Run Tests:** Run the E2E test suite. Because Nest relies heavily on metadata (decorators), refactoring can sometimes accidentally remove or bypass a Guard or Pipe. E2E tests catch this.

---

## Verification

- [ ] App starts successfully without DI errors.
- [ ] No `try/catch` blocks exist in controllers for standard HTTP responses.
- [ ] `AppModule` is clean and acts only as an orchestrator.
- [ ] E2E tests pass, verifying the HTTP request lifecycle remains intact.
