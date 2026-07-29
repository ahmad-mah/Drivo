# Drivo — Ride-Hailing MVP

Three independent projects: backend API, mobile app, and admin dashboard.

## Branches

| Branch | Project | Status |
|--------|---------|--------|
| `main` | Root docs | README + shared config |
| `backend` | Express + Prisma + PostgreSQL API | Running |
| `mobile` | Expo SDK 56 + React Native app | Running |
| `admin` | Vite 8 + React 19 + Tailwind CSS 4 | Scaffolded |

---

## 1. Backend (`backend` branch)

**Stack:** Express 4, TypeScript, Prisma 6, PostgreSQL (Neon), Clerk, Zod

### Architecture

Clean layered modular monolith:

```
src/
├── app.ts                  # Express app (middleware stack, route mounting)
├── server.ts               # Entry point (DB connect, listen, signals)
├── config/
│   ├── env.ts              # Zod-validated env vars
│   └── database.ts         # PrismaClient singleton
├── errors/                 # AppError base + 7 subclasses (400-500)
├── middleware/
│   ├── auth.middleware.ts  # requireAuth guard (Clerk)
│   ├── error.middleware.ts # Global error handler
│   ├── notFound.ts         # 404 catch-all
│   └── validate.middleware.ts # Zod body validator factory
└── modules/
    └── <module>/
        ├── *.routes.ts     # Router definition
        ├── *.controller.ts # Request/response handling
        ├── *.service.ts    # Business logic
        ├── *.repository.ts # Data access (Prisma)
        └── *.types.ts      # DTOs / interfaces
```

**Current modules:** `users/`, `webhook/` (Clerk webhook sync)

### Layers

| Layer | Responsibility |
|---|---|
| **Routes** | Define paths, wire middleware + controller |
| **Controllers** | Extract request data, call service, format response |
| **Services** | Business logic, cross-module calls, throw `AppError` |
| **Repositories** | Prisma queries, accept optional transaction client |

### Middleware Stack

1. `helmet()` — security headers
2. `cors()` — CORS
3. `morgan('dev')` — request logging
4. `/api/webhook` — raw body (before JSON parser)
5. `express.json()` — JSON parser
6. `clerkMiddleware()` — Clerk auth
7. `/api/users` — user routes
8. `notFoundHandler` — 404
9. `errorHandler` — global error handler

### Getting Started

```bash
cd backend
npm install
cp .env.example .env  # Fill in DATABASE_URL, Clerk keys
npx prisma migrate dev
npm run dev            # Port 3000
```

---

## 2. Mobile (`mobile` branch)

**Stack:** Expo SDK 56, React 19, Expo Router, NativeWind 5, Tailwind CSS 4, Clerk, Axios, Zod

### Architecture

Feature-based modules + Expo Router file-based routing:

```
src/
├── app/
│   ├── _layout.tsx           # Providers: Clerk, AppReady, Snackbar, Auth
│   ├── index.tsx             # Entry → redirect based on onboarding
│   └── (app)/
│       ├── _layout.tsx       # Onboarding gate
│       ├── onboarding/       # 3-slide carousel
│       └── (auth)/           # Welcome, Sign In, Sign Up
│       └── (root)/           # Authenticated tabs
├── features/                 # Domain modules
│   ├── auth/                 # Screens, hooks, components, schema, types, data
│   ├── onboarding/           # Screens, hooks, components, constants
│   ├── home/                 # Screens, hooks, components, utils
│   ├── history/              # Placeholder
│   ├── chat/                 # Placeholder
│   └── profile/              # Minimal
├── api/                      # Axios client, interceptors, token provider
├── shared/                   # Reusable components + contexts
├── errors/                   # 5 typed error classes
├── hooks/                    # Global hooks
├── lib/                      # Context + pure functions
├── providers/                # Clerk → axios token bridge
└── constants/                # env.ts
```

### Route Map

```
/  → redirect
├── onboarding (if first launch)
├── welcome → sign-in / sign-up
└── tabs: home, history, chat, profile
```

### Guards

- **Onboarding Gate** (`(app)/_layout.tsx`): redirects to onboarding if unseen
- **Auth Redirect** (`(auth)/_layout.tsx`): redirects signed-in users to home
- **Auth Required** (`(root)/_layout.tsx`): redirects anonymous users to sign-in

### Getting Started

```bash
cd mobile
npm install
cp .env.example .env  # Fill in Clerk key, API URL, Google keys, etc.
npx expo start         # Expo dev server
```

---

## 3. Admin (`admin` branch)

**Stack:** Vite 8, React 19, TypeScript 6, Tailwind CSS 4

### Architecture

Blank scaffold — no routing, no auth, no features yet.

```
src/
├── main.tsx     # React entry point
├── App.tsx      # Placeholder
└── index.css    # @import "tailwindcss"
```

### Getting Started

```bash
cd admin
npm install
npm run dev       # Port 5173
```

---

## Development Workflow

All three projects run independently in separate terminals:

| Project | Command | Port |
|---------|---------|------|
| Backend | `cd backend && npm run dev` | 3000 |
| Mobile | `cd mobile && npx expo start` | 8081 |
| Admin | `cd admin && npm run dev` | 5173 |

---

## Architecture Principles

- **No monorepo tool** — each project is standalone
- **Feature-based modules** — each feature owns its screens, hooks, components, and types
- **Clean layering** — routes → controllers → services → repositories
- **External auth** — Clerk handles authentication; backend verifies via middleware
- **Zod validation** — env vars and request bodies are validated at the boundary
- **Custom error classes** — typed errors with HTTP status codes, caught by global handler
- **Token injection** — mobile registers Clerk's `getToken` into the Axios interceptor via inversion of control
