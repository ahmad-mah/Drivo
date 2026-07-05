# NestJS Code Review Checklist

## Base Workflow
Follow `rules/code-review-standards.md` for general review process. This document adds NestJS-specific review criteria.

---

## NestJS Review Checklist

### Architecture & DI

- [ ] Features are organized into discrete Modules.
- [ ] Services are injected via constructors (`constructor(private readonly...)`), never instantiated with `new`.
- [ ] The `AppModule` is clean and delegates to Feature Modules.
- [ ] `exports` arrays only contain Providers that are explicitly meant to be public to other modules.

### Controllers & HTTP

- [ ] `@Req()` and `@Res()` are NOT used. (Use `@Body`, `@Query`, `@Param` instead).
- [ ] Controllers contain NO business logic or database queries.
- [ ] No manual `try/catch` blocks exist in controllers (exceptions should bubble up to global filters).
- [ ] Standard Nest exceptions (`NotFoundException`, etc.) are thrown instead of generic JavaScript Errors.

### Validation & DTOs

- [ ] DTOs are defined as `class`, not `interface` or `type`.
- [ ] DTOs utilize `class-validator` decorators for all properties.
- [ ] Incoming `@Body()` parameters are strongly typed with a DTO class.
- [ ] Route parameters use Pipes for transformation/validation (e.g., `@Param('id', ParseIntPipe)`).

### Security & Guards

- [ ] Authentication is handled via `@UseGuards()`, not manual checks inside the controller.
- [ ] Authorization (Role checking) is handled via Guards and Metadata (`@Roles()`), not inline logic.
- [ ] Passwords and sensitive data are hidden using `@Exclude()` and `ClassSerializerInterceptor`.
- [ ] Raw SQL strings are absent (preventing SQL injection).

---

## Red Flags (Blocking Issues)

| Red Flag                                    | Why It Blocks                             |
| ------------------------------------------- | ----------------------------------------- |
| Circular Dependencies (`forwardRef`)        | Indicates a fundamental flaw in module design and domain boundaries. |
| Injecting Request object into a Service     | Breaks testability and Microservice compatibility. |
| Missing `@Injectable()`                     | Will crash the Dependency Injection container. |
| Using `any` in `@Body()`                    | Bypasses the entire validation and typing system. |
| `interface` used for a DTO                  | `ValidationPipe` will silently fail because interfaces are erased at compile time. |

---

## Green Flags (Praise-Worthy)

| Green Flag                                  | Why It's Good                             |
| ------------------------------------------- | ----------------------------------------- |
| Constructor dependency injection            | Follows IoC principles and allows easy testing with Mocks. |
| Custom Parameter Decorators                 | (e.g., `@CurrentUser()`) Keeps controllers clean and decoupled from Express. |
| `PartialType` for Update DTOs               | Prevents DRY violations when defining Update payloads. |
| Isolated Unit Tests via `TestingModule`     | Proves the developer understands Nest's testing utilities. |
