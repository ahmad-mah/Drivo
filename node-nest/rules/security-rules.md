# Security Rules

## Purpose

Enforceable rules to harden a NestJS application against common web vulnerabilities, utilizing Nest's built-in tools and community packages.

---

## HTTP Security (Helmet & CORS) — MUST

### 1. Enable Helmet
You MUST use the `helmet` package to automatically set secure HTTP headers. Apply it globally in `main.ts`.

```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  await app.listen(3000);
}
```

### 2. Configure CORS
If your API is consumed by a frontend application on a different domain, you MUST configure CORS securely. Do NOT leave it wide open (`*`) in production.

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL, // e.g., 'https://myapp.com'
  credentials: true,
});
```

---

## Input Validation & Sanitization — MUST

### 3. Global Validation Pipe
You MUST use `ValidationPipe` globally to strip out unwanted payload properties and validate types.

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // Strips unexpected fields
  forbidNonWhitelisted: true, // Throws 400 if unexpected fields exist
}));
```

### 4. Prevent Parameter Pollution & Injection
- Avoid raw SQL strings in TypeORM or Prisma to prevent SQL Injection.
- Do not trust IDs. Validate that UUIDs are actually UUIDs using `@Param('id', ParseUUIDPipe)`.

---

## Authentication & Rate Limiting — MUST

### 5. Rate Limiting
Apply `@nestjs/throttler` to prevent brute-force attacks and DDoS.

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10,  // 10 requests max per minute per IP
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Applies globally
    },
  ],
})
```

### 6. Protect Sensitive Data in Responses
You MUST use `ClassSerializerInterceptor` to strip sensitive data (like passwords, password reset tokens) from JSON responses.

```typescript
// user.entity.ts
import { Exclude } from 'class-transformer';

export class User {
  @Exclude() // Stripped from the response
  password: string;
}

// controller.ts
@UseInterceptors(ClassSerializerInterceptor)
@Get()
```

---

## Quality Checklist

- [ ] `helmet` is installed and applied in `main.ts`.
- [ ] CORS is configured explicitly, rejecting unknown origins in production.
- [ ] `ValidationPipe` is enabled globally with `whitelist: true`.
- [ ] `@nestjs/throttler` is implemented to prevent DDoS and brute-force attacks.
- [ ] Passwords and sensitive tokens are hidden from responses using `@Exclude()` and `ClassSerializerInterceptor`.
