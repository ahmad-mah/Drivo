# Modules & Dependency Injection (DI)

## 1. Load Conditions
- **Trigger**: Architecting features, registering providers, resolving DI crashes ("Nest can't resolve dependencies").
- **Prerequisites**: `node-nest/rules/project-structure.md`

## 2. Core Directives
- **Feature Encapsulation**: Every domain feature MUST have its own `@Module()`.
- **Constructor Injection**: ALWAYS inject dependencies via `constructor(private readonly service: Service)`. NEVER use `new Service()`.
- **Strict Exports**: ONLY export Providers (`Services`) that are explicitly required by other modules. Do NOT export Controllers.

## 3. Implementation Workflow

### Step 1: Define Feature Module
Register controllers and providers.
```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export ONLY if other modules need UsersService
})
export class UsersModule {}
```

### Step 2: Import Cross-Feature Dependencies
If `OrdersModule` needs `UsersService`, it MUST import `UsersModule`. Do NOT import `UsersService` directly into providers.
```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule], // Unlocks UsersService for injection
  providers: [OrdersService],
})
export class OrdersModule {}
```

### Step 3: Handle Global Providers (Use Sparingly)
Use `@Global()` ONLY for universally required modules (e.g., Config, Database).
```typescript
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Error | Correction |
| --- | --- |
| "Nest can't resolve dependencies" | Ensure the provider is in the current module's `providers`, OR its host module is in `imports` and exports it. |
| Providing a Service in two modules | Creates Singleton duplicates. Import the module instead of duplicating the provider. |
| Circular Dependencies (`forwardRef`) | Architecture flaw. Extract shared logic to a 3rd module instead of cross-importing. |
| The "God Module" | `AppModule` MUST ONLY contain imports of Feature Modules, not a massive list of all controllers. |

## 5. Verification Checklist
- [ ] Feature has a dedicated `@Module()`.
- [ ] Dependencies injected via `constructor`.
- [ ] `new` keyword NEVER used for Services/Repositories.
- [ ] Inter-module dependencies resolved via `imports` array, not provider duplication.
- [ ] `AppModule` serves only as a root orchestrator.
