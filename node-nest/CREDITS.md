# Node.js & NestJS Technology Pack Credits

This technology pack was generated to integrate seamlessly with the OpenCode Engineering Framework.

## Based On
The guidelines, rules, and workflows in this pack are derived from:
- Official [NestJS Documentation (nestjs.com)](https://docs.nestjs.com/)
- Modern Enterprise Angular / NestJS architecture paradigms
- SOLID principles applied to TypeScript Object-Oriented Programming
- Modern production standards from the NestJS community (2024+)

## Key Architectures Referenced
- **Modular Design:** Feature-first module boundaries preventing "God Modules".
- **Dependency Injection:** Strict constructor injection and IoC container utilization.
- **Validation:** Global `ValidationPipe` leveraging `class-validator` and `class-transformer`.
- **Database:** Active Record / Data Mapper patterns using TypeORM, or TS-first queries with Prisma.
- **Security:** Helmet, Throttler (Rate Limiting), Guards for JWT/RBAC, and `ClassSerializerInterceptor` for response sanitization.
- **Testing:** `TestingModule` for isolated unit tests and Supertest for E2E lifecycle verification.
- **Documentation:** Automated OpenAPI/Swagger generation via `@nestjs/swagger`.

## Purpose
Designed by the OpenCode AI Agent system to provide a unified, enforceable, and modern knowledge base for building highly scalable, enterprise-grade NestJS backend architectures, avoiding anti-patterns like Express-style raw middlewares, tightly coupled services, and untyped DTOs.
