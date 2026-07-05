# Database Integration

## 1. Load Conditions
- **Trigger**: Connecting to a database, executing queries, structuring the Repository layer.
- **Prerequisites**: `node-express/rules/project-structure.md`

## 2. Core Directives
- **Singleton Connection**: The DB connection (Prisma/TypeORM) MUST be a singleton. NEVER instantiate per-request.
- **Repository Isolation**: Controllers MUST NEVER execute database queries. Move queries to Repositories.
- **No N+1 Queries**: List endpoints MUST fetch relations efficiently (e.g., JOINs, Prisma `include`) and MUST enforce pagination.

## 3. Implementation Workflow

### Step 1: Singleton Client (Prisma Example)
```typescript
import { PrismaClient } from '@prisma/client';

declare global { var prisma: PrismaClient | undefined; }

export const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
```

### Step 2: The Repository Pattern
```typescript
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
}
```

### Step 3: Transactions
Use transactions for multi-step dependent writes.
```typescript
const transferMoney = async (fromId: string, toId: string, amount: number) => {
  return await prisma.$transaction(async (tx) => {
    await tx.account.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
    await tx.account.update({ where: { id: toId }, data: { balance: { increment: amount } } });
  });
};
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Returning raw entities | Sends passwords/salts to client. MUST strip sensitive fields via select/DTOs. |
| For-Loop Queries (N+1) | querying DB inside a loop. MUST use `include`/JOINs or `IN` arrays. |
| Missing Pagination | Returns 1M rows, crashing server (OOM). ALWAYS enforce `limit/offset`. |

## 5. Verification Checklist
- [ ] DB Client initialized exactly once on startup.
- [ ] DB calls isolated in Repository or DAO classes.
- [ ] Multi-step writes protected by Transactions.
- [ ] Sensitive database columns stripped from responses.
