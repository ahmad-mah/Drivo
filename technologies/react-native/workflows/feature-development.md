# React Native Feature Development Workflow

## Base Workflow
Follow `workflows/feature-development.md` as the foundation. This document adds React Native-specific steps.

---

## React Native-Specific Steps

### Step 2 (Design) — React Native Additions

**Component Tree Design:**
1. Sketch the component tree before coding.
2. Identify which components are "smart" (data fetchers, state owners) vs "dumb" (pure UI rendering props).
3. Decide on state management scope (React Query vs Zustand vs local `useState`).

```
// Example component tree sketch for an Orders feature
app/(tabs)/orders.tsx (Router entry point — Smart)
└── OrdersScreen (Smart — fetches data)
    ├── OrdersHeader (Dumb)
    ├── OrdersFilter (Smart — local filter state)
    │   └── FilterChip × N (Dumb)
    └── FlashList (Dumb list container)
        └── OrderCard × N (Dumb)
            ├── OrderStatusBadge (Dumb)
            └── OrderTotalLabel (Dumb)
```

**State Design:**
Determine where API calls will live. Always default to custom hooks wrapping React Query.

```tsx
// src/features/orders/api/useOrders.ts
export const useOrders = (status?: string) => {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => fetchOrders(status),
  });
};
```

### Step 3 (Plan) — React Native Build Order

```
1. Types (TypeScript interfaces for API responses and component props)
2. API Hooks (React Query wrappers)
3. Global State (Zustand stores, if needed)
4. Dumb UI Components (Card, Badge, Button — bottom-up)
5. Smart UI Components / Screens (Wire API hooks to UI)
6. Routing (Create file in app/ directory, passing IDs if necessary)
```

### Step 4 (Implement) — Implementation Checklist

For each dumb component:
- [ ] Props defined in a TypeScript `interface`.
- [ ] No API calls or global state imports.
- [ ] Styled using Tailwind/NativeWind or `StyleSheet`.
- [ ] Safe Area respected (if at the top/bottom of screen).
- [ ] Interactive elements wrapped in `Pressable` or `TouchableOpacity` with hit slop.

For each smart component/screen:
- [ ] Data fetched using a custom hook (React Query).
- [ ] All UI states handled explicitly:
  - `isLoading` → Render Skeleton or Spinner
  - `isError` → Render Error boundary/message with Retry button
  - `data.length === 0` → Render Empty State illustration
  - `data` → Render the actual UI
- [ ] Extracted complex inline functions using `useCallback` (especially for lists).

### Step 5 (Verify) — React Native-Specific Checks

```bash
# Run TypeScript type check
tsc --noEmit

# Run Linter
eslint .

# Run Tests
jest
```

**Manual verification (Simulator/Device):**
- [ ] Test on both iOS Simulator and Android Emulator (UI padding/shadows often differ).
- [ ] Open the software keyboard — ensure input fields are not covered (use `KeyboardAvoidingView`).
- [ ] Enable Dark Mode in system settings — ensure colors adapt correctly.
- [ ] Test without internet — verify the error state appears gracefully.

---

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│ REACT NATIVE FEATURE FLOW                        │
│                                                  │
│ 1. Define Types (TS Interfaces)                  │
│ 2. Build API Hooks (React Query)                 │
│ 3. Build Dumb UI Components (bottom-up)          │
│ 4. Build Smart Feature Component                 │
│ 5. Create Route in app/ directory                │
│ 6. Handle Loading/Error/Empty States             │
│ 7. Test on iOS & Android                         │
│ 8. Verify Keyboard & Safe Areas                  │
└─────────────────────────────────────────────────┘
```
