# NestJS Rules

## Purpose

NestJS-specific rules and standards that extend the generic engineering framework. These rules cover NestJS architectural paradigms, TypeScript decorators, project structure, and security.

## Directory Structure

```
node-nest/rules/
├── README.md                 # This file — purpose and overview
├── nest-idioms.md            # Decorators, RxJS, Metadata
├── project-structure.md      # Feature modules, Monorepo setups
├── security-rules.md         # Helmet, CORS, Data Sanitization
└── testing-rules.md          # Jest and TestingModule configuration
```

## Rule Priority

When generic engineering rules conflict with NestJS-specific rules, **NestJS rules take precedence**. NestJS enforces an Angular-like, highly structured OOP architecture that overrides general Node.js/Express advice (like using raw Express middlewares).

## Always-Loaded Rules

These rules should be loaded for **every** NestJS task:
1. `nest-idioms.md` — Decorator usage, constructor injection
2. `project-structure.md` — Feature-first modular organization
