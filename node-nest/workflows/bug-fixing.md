# NestJS Bug Fixing Workflow

## Base Workflow
Follow `workflows/bug-investigation.md` as the foundation. This document adds NestJS-specific debugging techniques.

---

## Common NestJS Bug Categories

### 1. Dependency Injection Failures

```
Symptom: Error: "Nest can't resolve dependencies of the UsersService (?). Please make sure that the argument X at index [0] is available in the UsersModule context."
Diagnosis: The IoC container doesn't know how to inject a dependency.
Fixes:
  1. Is the dependency part of the current module? Check `providers` array.
  2. Is the dependency from another module? 
     - Did you add that module to the `imports` array?
     - Did the other module add the dependency to its `exports` array?
  3. Is it a TypeORM Repository? Ensure `TypeOrmModule.forFeature([Entity])` is in `imports`.
```

### 2. Circular Dependencies

```
Symptom: Error: "A circular dependency has been detected. Please, make sure that each side of a bidirectional relationships are decorated with forwardRef()..."
Diagnosis: Module A imports Module B, and Module B imports Module A.
Fixes:
  - Architecture Fix (Best): Extract the shared logic into a common `Module C`.
  - Band-Aid Fix: Use `forwardRef(() => ModuleName)` in both modules' imports arrays, and `@Inject(forwardRef(() => ServiceName))` in the constructors.
```

### 3. Payload Validation Failing Silently

```
Symptom: A POST request works, but the fields are missing or not saving to the DB.
Diagnosis: The `ValidationPipe` is stripping fields because they are not listed in the DTO.
Fix: Ensure `whitelist: true` is enabled, and verify that EVERY field you want to accept in the `req.body` has a decorator (like `@IsString()` or at least `@IsOptional()`) in the DTO.
```

### 4. Middleware/Guard/Interceptor Not Firing

```
Symptom: An `@UseGuards()` or Interceptor seems completely ignored.
Diagnosis: 
  - If applied globally, check `main.ts` or `app.module.ts` providers.
  - Nest execution order: Middleware → Guards → Interceptors → Pipes → Controller.
  - If a Guard throws an error, Interceptors will NOT run.
Fix: Place logging in each step to verify the lifecycle flow.
```

### 5. TypeORM Connection Closed / Memory Leaks

```
Symptom: Unhandled exceptions related to Database connection dropped.
Diagnosis: Do not manually open/close connections in Services. Let the `TypeOrmModule` (or `PrismaModule`) manage the connection lifecycle.
```

---

## NestJS Debugging Tools

**Enable Detailed Logging:**
If Nest fails to start, it usually logs the exact file and dependency causing the issue. If more info is needed, enable debug logs via the environment:
```bash
NEST_DEBUG=true npm run start:dev
```

**Testing the Fix:**
- If fixing a DI issue, simply running `npm run build` or starting the app will verify the fix.
- If fixing a validation or pipeline issue, you MUST write an E2E test to reproduce the exact HTTP request lifecycle.
