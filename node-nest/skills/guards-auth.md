# Guards & Authentication

## 1. Load Conditions
- **Trigger**: Protecting routes, enforcing RBAC (Role-Based Access Control), extracting authenticated user payload.
- **Prerequisites**: `node-nest/skills/controllers-routing.md`

## 2. Core Directives
- **Guards Only**: Authentication and Authorization MUST be handled by Guards implementing `CanActivate`. NEVER use Express middleware for auth.
- **Execution Order**: `@UseGuards(AuthGuard, RolesGuard)`. Auth identifies WHO, Roles checks WHAT. Order matters.
- **Decoupled Extraction**: NEVER use `req.user` in a Controller. Use a custom `@CurrentUser()` decorator.

## 3. Implementation Workflow

### Step 1: Authentication Guard
Use `@nestjs/passport` for JWT.
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Step 2: RBAC (Authorization) Guard
Read metadata set by `@Roles()` and verify against `req.user`.
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    
    const request = context.switchToHttp().getRequest();
    if (!roles.some(r => request.user?.roles?.includes(r))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
```

### Step 3: Controller Usage
Protect routes and extract the user.
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
);

@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
create(@CurrentUser() user: UserPayload, @Body() dto: CreateDto) {
  // Logic here
}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Using Express Middleware for Auth | Middleware runs before Nest context. Use Guards to access Reflector metadata. |
| Reversing Guard Order | `RolesGuard` fails if `AuthGuard` hasn't attached the user yet. |
| Using `req.user` in controller | Violates framework agnosticism. Extract via `@CurrentUser()`. |

## 5. Verification Checklist
- [ ] Authentication implemented via `CanActivate` Guards.
- [ ] Route protection applied via `@UseGuards()`.
- [ ] Metadata extraction (`Reflector`) used for RBAC.
- [ ] Custom `@CurrentUser()` decorator used to extract payload.
