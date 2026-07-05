# State Management

## 1. Load Conditions
- **Trigger**: Fetching API data, sharing data across screens, managing complex local state.
- **Prerequisites**: `react-native/rules/react-idioms.md`

## 2. Core Directives
- **Server State vs Client State**: 
  - API data MUST use React Query (TanStack).
  - Global UI state (theme, modals) MUST use Zustand.
- **No useEffect Chains**: NEVER use `useEffect` to synchronize state variables (e.g., setting `B` when `A` changes). Derive it directly during render.
- **Colocate State**: State MUST live as close to where it's used as possible. Don't make everything global.

## 3. Implementation Workflow

### Step 1: Server State (React Query)
Handles caching, loading, errors, and background updates.
```tsx
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });
};

// Usage
const { data, isLoading, error } = useUser('123');
```

### Step 2: Global Client State (Zustand)
```tsx
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
```

### Step 3: Derived State (No useEffect)
```tsx
// ❌ ANTI-PATTERN
const [fullName, setFullName] = useState('');
useEffect(() => { setFullName(`${first} ${last}`) }, [first, last]);

// ✅ CORRECT
const fullName = `${first} ${last}`;
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Storing API data in Zustand | Redundant and stale. Use React Query to manage async data caching. |
| Object references in `useEffect` deps | Triggers infinite loops. Memoize objects with `useMemo`, or extract primitives. |
| Giant global state objects | Split Zustand stores into logical slices (e.g., `useAuthStore`, `useSettingsStore`). |

## 5. Verification Checklist
- [ ] React Query used exclusively for external data fetching.
- [ ] Zustand used exclusively for global UI/client state.
- [ ] `useEffect` is NOT used to sync derived state.
- [ ] Dependency arrays in hooks (`useEffect`, `useCallback`) are exhaustive and accurate.
