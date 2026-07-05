# NestJS Documentation Workflow

## Base Workflow
Follow `skills/documentation.md` for general documentation principles. This document adds NestJS-specific Swagger automation.

---

## Documentation Flow

```
1. OpenAPI (Swagger) Decorators → 2. TSDoc → 3. README
```

---

## Step 1: OpenAPI (Swagger) Automation — MUST

NestJS provides a powerful `@nestjs/swagger` module that auto-generates your OpenAPI specification directly from your code, Controllers, and DTOs.

### 1. Setup in `main.ts`

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT Auth button to Swagger UI
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Hosts the documentation at http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
```

### 2. Documenting DTOs

Swagger needs to know the shape of your request/response objects. Decorate your DTO properties with `@ApiProperty()`.

```typescript
// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Alice', description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'alice@test.com' })
  @IsEmail()
  email: string;
}
```

*Tip: If using the Nest CLI plugin for Swagger in `nest-cli.json`, `@ApiProperty` can be inferred automatically, reducing boilerplate.*

### 3. Documenting Controllers

Add explicit responses to your controllers so frontend developers know exactly what to expect.

```typescript
// src/users/users.controller.ts
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users') // Groups these endpoints together in the UI
@Controller('users')
export class UsersController {

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth() // Indicates this route requires the JWT token
  @UseGuards(JwtAuthGuard)
  findAll() {
    // ...
  }
}
```

---

## Step 2: Code-Level Documentation (TSDoc)

Use standard TSDoc (`/** */`) for complex methods in your Services. Swagger handles the HTTP layer; TSDoc handles internal logic.

```typescript
/**
 * Processes an order payment through the external Stripe API.
 * 
 * @param orderId - The internal ID of the order.
 * @throws {PaymentFailedException} If the external API rejects the card.
 * @returns The completed Transaction record.
 */
async processPayment(orderId: string): Promise<Transaction> { ... }
```

---

## Step 3: Project Documentation (README)

Your `README.md` must include explicit instructions for running the NestJS ecosystem.

### Required Sections

1. **Prerequisites:** (Node version, Database)
2. **Installation:** `npm install`
3. **Running the app:**
   ```bash
   # development
   npm run start

   # watch mode
   npm run start:dev

   # production mode
   npm run start:prod
   ```
4. **Test commands:** `npm run test`, `npm run test:e2e`
5. **Swagger UI Link:** Where to view the API docs locally (e.g., `http://localhost:3000/api`).

---

## Quality Checklist

- [ ] `@nestjs/swagger` is configured in `main.ts` and the UI is accessible in development.
- [ ] DTO properties are decorated with `@ApiProperty()` (or inferred via CLI plugin) to define models.
- [ ] Controllers are tagged with `@ApiTags()`.
- [ ] Endpoints clearly define expected `@ApiResponse()` codes (200, 400, 404).
- [ ] Protected endpoints are marked with `@ApiBearerAuth()`.
