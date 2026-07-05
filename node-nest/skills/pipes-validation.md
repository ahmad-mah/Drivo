# Pipes & Validation

## 1. Load Conditions
- **Trigger**: Parsing/validating incoming payloads (`@Body`, `@Query`, `@Param`).
- **Prerequisites**: `node-nest/skills/controllers-routing.md`

## 2. Core Directives
- **DTOs as Classes**: DTOs MUST be `class`es, NOT `interface`s or `type`s.
- **Global Pipe**: ALWAYS use `ValidationPipe` globally to strip unexpected fields.
- **Declarative Rules**: Validation MUST use `class-validator` decorators. NEVER use manual `if/else` validation in controllers.

## 3. Implementation Workflow

### Step 1: Enable Global Validation (main.ts)
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Strips undefined fields
    forbidNonWhitelisted: true, // Throws 400 if extra fields sent
    transform: true,            // Auto-transforms string query params to numbers/booleans
  }),
);
```

### Step 2: Define DTO (Data Transfer Object)
```typescript
import { IsString, IsEmail, IsOptional, IsInt, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number) // Forces transformation (vital for @Query)
  age?: number;
}
```

### Step 3: Handle Nested Objects & Updates
- **Nested**: MUST use `@ValidateNested()` and `@Type(() => Class)`.
- **Updates**: MUST use `PartialType` to inherit create rules but make them optional.
```typescript
import { PartialType } from '@nestjs/mapped-types'; // or @nestjs/swagger
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| `interface CreateDto` | TypeScript erases interfaces. ValidationPipe fails silently. MUST use `class`. |
| Missing `@Type()` on nested arrays/objects | Validation won't recurse. Add `@ValidateNested()` + `@Type()`. |
| Manual validation in controller | Move logic to DTO via `class-validator` decorators. |

## 5. Verification Checklist
- [ ] `ValidationPipe` is enabled globally with `whitelist: true`.
- [ ] All `@Body()` parameters use `class` DTOs.
- [ ] `class-validator` decorators define exact constraints.
- [ ] `ParseIntPipe` or `ParseUUIDPipe` used for `@Param()` coercion.
