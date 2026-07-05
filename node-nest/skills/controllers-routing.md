# Controllers & Routing

## 1. Load Conditions
- **Trigger**: Creating/modifying REST endpoints, parsing request data, setting HTTP status codes.
- **Prerequisites**: `node-nest/rules/nest-idioms.md`

## 2. Core Directives
- **Thin Controllers**: Controllers MUST ONLY handle HTTP routing, decorator extraction, and delegating to Services. Max 3-5 lines per method.
- **Framework Agnosticism**: NEVER use Express-specific `@Req()` or `@Res()` unless handling raw streams (e.g., file downloads).
- **No Business Logic**: NEVER place `if/else` business rules or DB calls in a controller.
- **No Manual Try/Catch**: NEVER catch exceptions in controllers. Let Nest's global exception filters handle them.

## 3. Implementation Workflow

### Step 1: Define Controller & Inject Service
Use `@Controller('path')` and constructor injection.
```typescript
import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
}
```

### Step 2: Extract Payload via Decorators
Use strict Nest decorators instead of raw request objects.

| Target | Decorator | Purpose |
| --- | --- | --- |
| Body | `@Body()` | POST/PUT JSON payload. MUST use a DTO class. |
| URL Param | `@Param('id')` | Route parameters. Use Pipes (e.g., `ParseUUIDPipe`). |
| Query String | `@Query('page')` | Query parameters. |
| Headers | `@Headers('token')` | Specific HTTP headers. |

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Using `interface` for `@Body()` DTO | Interfaces vanish at runtime. MUST use `class` for `class-validator` to work. |
| Manual parameter parsing | Use built-in Pipes (e.g., `@Param('id', ParseIntPipe)` instead of `parseInt()`). |
| Returning `res.status(200)` | Return the data directly. Nest automatically handles 200/201 responses. |

## 5. Verification Checklist
- [ ] Controller class has `@Controller('prefix')`.
- [ ] Dependencies injected via `constructor(private readonly ...)`.
- [ ] No `@Req()` or `@Res()` decorators used.
- [ ] No `try/catch` blocks present.
- [ ] All `@Body()` inputs use `class` DTOs, not interfaces or `any`.
- [ ] Type coercion handled by Pipes (e.g., `ParseIntPipe`).
