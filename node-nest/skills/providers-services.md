# Providers & Services

## 1. Load Conditions
- **Trigger**: Writing business logic, interacting with DB repositories, registering custom factories.
- **Prerequisites**: `node-nest/skills/modules-di.md`

## 2. Core Directives
- **Decorator Requirement**: ALL services MUST be decorated with `@Injectable()`.
- **Pure Business Logic**: Services MUST NOT import Express objects (`Req`, `Res`). They are HTTP-agnostic.
- **Native Exceptions**: Services MUST throw Nest `HttpException` subclasses (e.g., `NotFoundException`), NOT generic `Error` objects.
- **Single Responsibility**: Services exceeding 300 lines MUST be split into smaller, focused Providers.

## 3. Implementation Workflow

### Step 1: Standard Service
Inject repositories, execute logic, throw errors on failure.
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(email: string) {
    if (await this.userRepository.findByEmail(email)) {
      throw new ConflictException('Email exists');
    }
    return this.userRepository.save({ email });
  }
}
```

### Step 2: Custom Providers (Factory / Value)
Use for configuration, external SDKs, or dynamic injection.
```typescript
// useValue (Constants/Mocks)
{ provide: 'API_KEY', useValue: 'secret123' }

// useFactory (Async Initialization)
{
  provide: 'DB_CONNECTION',
  useFactory: async (config: ConfigService) => createConnection(config.url),
  inject: [ConfigService],
}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Missing `@Injectable()` | Nest DI container will crash. Always decorate. |
| Throwing `new Error()` | Results in generic 500 error. Use `BadRequestException`, `NotFoundException`, etc. |
| Property Injection | Lazy property injection (`@Inject() param`) masks circular dependencies. Use Constructor Injection. |

## 5. Verification Checklist
- [ ] Class decorated with `@Injectable()`.
- [ ] Constructor injection used exclusively.
- [ ] No HTTP objects (`Req`, `Res`) present in the Service.
- [ ] Expected errors throw standard Nest Exceptions.
