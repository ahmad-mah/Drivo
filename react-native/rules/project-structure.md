# React Native Project Structure

## Purpose

Defines how a modern React Native (Expo) project should be organized for maximum navigability, feature isolation, and scalability. This extends the generic `skills/code-organization.md`.

---

## Standard Expo Project Structure

```
my-app/
├── app/                        # Expo Router pages (Screens & Layouts)
│   ├── _layout.tsx             # Root layout (Providers, Root Stack)
│   ├── index.tsx               # Route: /
│   ├── (auth)/                 # Route Group
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   └── (tabs)/                 # Route Group for bottom tabs
│       ├── _layout.tsx
│       ├── home.tsx
│       └── profile.tsx
├── src/                        # Source code (everything not a route)
│   ├── components/             # Global/Shared UI components
│   │   ├── ui/                 # Dumb components (Button, Input, Card)
│   │   └── form/               # Form-specific wrappers
│   ├── features/               # Feature-based modules (The bulk of the app)
│   │   ├── orders/
│   │   │   ├── api/            # API calls (React Query hooks)
│   │   │   ├── components/     # Feature-specific components
│   │   │   ├── store/          # Feature-specific Zustand store
│   │   │   └── types/          # Feature-specific TS interfaces
│   │   └── auth/
│   │       ├── api/
│   │       ├── components/
│   │       └── store/
│   ├── hooks/                  # Global custom hooks (e.g., useKeyboard, useTheme)
│   ├── lib/                    # 3rd party library configurations (axios, supabase)
│   ├── store/                  # Global Zustand stores (e.g., useUserStore)
│   ├── types/                  # Global TypeScript definitions
│   ├── utils/                  # Pure helper functions (formatting, validation)
│   └── constants/              # Global constants (Colors, Theme, Config)
├── assets/                     # Static files (images, fonts)
├── app.json                    # Expo configuration
├── babel.config.js             # Babel config
├── package.json
└── tsconfig.json
```

---

## Rules

### 1. Separation of Routing and UI — MUST

The `app/` directory MUST ONLY contain routing logic and screen composition. 
- Screens in `app/` should ideally be thin wrappers that assemble components from `src/features/`.
- Do not put reusable components, API calls, or global state inside the `app/` directory.

### 2. Feature-Driven Architecture in `src/features/` — MUST

Organize business logic by feature, not by type. 

```
# BAD — organized by type (hard to find related files)
src/
  api/
    userApi.ts
    orderApi.ts
  components/
    UserProfile.tsx
    OrderList.tsx

# GOOD — organized by feature (co-located)
src/
  features/
    auth/
      api/login.ts
      components/LoginForm.tsx
    orders/
      api/getOrders.ts
      components/OrderList.tsx
```

### 3. The `src/components/` Directory is for SHARED UI Only

Only place components here if they are used across multiple features (e.g., `Button`, `TextField`, `Modal`, `Spinner`). If a component is only used by the `orders` feature, it belongs in `src/features/orders/components/`.

### 4. File Naming Conventions — MUST

| File Type                | Convention           | Example                           |
| ------------------------ | -------------------- | --------------------------------- |
| Routes (`app/`)          | `kebab-case.tsx`     | `settings.tsx`, `edit-profile.tsx`|
| Components               | `PascalCase.tsx`     | `SubmitButton.tsx`, `UserCard.tsx`|
| Hooks                    | `camelCase.ts`       | `useAuth.ts`, `useKeyboard.ts`    |
| Utils/Lib                | `camelCase.ts`       | `dateUtils.ts`, `apiClient.ts`    |
| Types                    | `index.ts` or `.ts`  | `types/index.ts`, `userTypes.ts`  |

### 5. Import Paths (Absolute Imports) — SHOULD

Configure `tsconfig.json` to support absolute imports to avoid `../../../../` hell.

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"]
    }
  }
}
```

Usage:
```tsx
// GOOD
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/store/useAuth';

// BAD
import { Button } from '../../../../components/ui/Button';
```

---

## Quality Checklist

- [ ] Routing is strictly contained within the `app/` directory (Expo Router).
- [ ] `app/` screens are thin and delegate complex UI to `src/features/` components.
- [ ] Business logic and components are organized by feature (`src/features/<feature_name>/`).
- [ ] `src/components/` is reserved strictly for generic, globally shared UI components.
- [ ] File naming conventions are followed (PascalCase for components, kebab/snake for routes).
- [ ] Absolute imports (`@/`) are used to prevent relative path hell.
