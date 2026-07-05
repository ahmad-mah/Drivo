# Database Integration

## 1. Load Conditions
- **Trigger**: Integrating TypeORM or Prisma, handling DB transactions.
- **Prerequisites**: `node-nest/skills/modules-di.md`

## 2. Core Directives
- **Data Access Isolation**: Controllers MUST NEVER interact with the database directly. Use Services/Repositories.
- **Entity Purity**: Entities MUST ONLY contain schema definitions. No business logic.
- **Transactions**: Multi-step DB writes MUST use transactions to prevent orphaned data.

## 3. Implementation Workflow

### Option A: TypeORM (Active Record / Repository)
1. **Define Entity**: `@Entity()`
2. **Register**: `TypeOrmModule.forFeature([User])` in module.
3. **Inject**: `@InjectRepository(User) private repo: Repository<User>` in Service.

```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async transfer(from: string, to: string, amount: number) {
    return this.dataSource.transaction(async manager => {
      await manager.decrement(User, { id: from }, 'balance', amount);
      await manager.increment(User, { id: to }, 'balance', amount);
    });
  }
}
```

### Option B: Prisma (TS-First)
1. **Module/Service**: Create a `PrismaService` extending `PrismaClient` and implementing `OnModuleInit`.
2. **Inject**: `constructor(private prisma: PrismaService)`.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() { await this.$connect(); }
}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Querying DB in Controller | Violates Layered Architecture. Move to Service. |
| Exposing DB relations infinitely | Leads to N+1 query problems. Explicitly define/paginate relations. |
| Forgetting `TypeOrmModule.forFeature` | "Nest can't resolve dependencies". Register Entities in the Module. |
| `synchronize: true` in Production | Data wipe risk. MUST use migrations in CI/CD pipeline. |

## 5. Verification Checklist
- [ ] Database client injected via Constructor.
- [ ] Transactions used for multi-step dependent writes.
- [ ] Pagination (`skip/take` or `limit/offset`) enforced on collection queries.
- [ ] Passwords/Sensitives stripped from entities before returning (via `@Exclude()`).
