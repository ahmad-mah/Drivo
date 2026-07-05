# Interceptors & Exception Filters

## 1. Load Conditions
- **Trigger**: Catching global errors, formatting JSON responses, stripping sensitive data from responses.
- **Prerequisites**: `node-nest/rules/nest-idioms.md`

## 2. Core Directives
- **Filters for Errors**: Unhandled exceptions MUST be caught by a Global Exception Filter to return consistent JSON.
- **Interceptors for Success**: Outgoing successful responses MUST be mapped using Interceptors (RxJS).
- **Data Sanitization**: NEVER manually delete sensitive fields (like passwords). MUST use `ClassSerializerInterceptor` and `@Exclude()`.

## 3. Implementation Workflow

### Step 1: Global Exception Filter
Catch and format errors, logging 500s.
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === 500) console.error(exception); // Alert!

    response.status(status).json({
      success: false,
      statusCode: status,
      message: exception instanceof HttpException ? exception.message : 'Internal Error',
    });
  }
}
// Apply in main.ts: app.useGlobalFilters(new AllExceptionsFilter());
```

### Step 2: Transform Interceptor
Standardize successful responses.
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map(data => ({ success: true, data })));
  }
}
```

### Step 3: Hiding Sensitive Data
```typescript
import { Exclude } from 'class-transformer';
export class User {
  @Exclude() password: string; // Will not be sent to client
}

// In Controller:
@UseInterceptors(ClassSerializerInterceptor)
@Get()
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Returning raw DB errors to client | Leaks schema. Catch DB errors and throw generic `HttpException`s. |
| Forgetting `next.handle()` | Request hangs indefinitely. Interceptors MUST return the RxJS stream. |
| Using Interceptors for errors | Interceptors map successful data. Use Filters to handle exceptions. |

## 5. Verification Checklist
- [ ] Global Exception Filter formats standard error JSON.
- [ ] 500 errors log stack traces securely.
- [ ] `ClassSerializerInterceptor` + `@Exclude()` used for passwords/secrets.
- [ ] RxJS `map` operator used correctly in Custom Interceptors.
