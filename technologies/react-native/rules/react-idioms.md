# React Idioms — Modern React 18+ & TypeScript

## Purpose

Rules for writing idiomatic, modern React code using TypeScript. These are React-specific conventions that go beyond generic programming practices.

---

## Language & Hook Rules

### 1. Rules of Hooks — MUST

Hooks are the core of modern React. You must obey these two rules at all times:
1. **Only call Hooks at the top level.** Do not call Hooks inside loops, conditions, or nested functions.
2. **Only call Hooks from React function components or custom Hooks.** Do not call them from regular JavaScript functions.

```tsx
// VIOLATION
const MyComponent = ({ isEnabled }) => {
  if (isEnabled) {
    const [data, setData] = useState(null); // Crash! Hook order changed.
  }
}

// CORRECT
const MyComponent = ({ isEnabled }) => {
  const [data, setData] = useState(null); // Top level
  if (!isEnabled) return null;
}
```

### 2. Exhaustive Dependencies — MUST

If you use a variable from the component scope inside `useEffect`, `useCallback`, or `useMemo`, it MUST be in the dependency array.

```tsx
// VIOLATION — missing dependency
const [query, setQuery] = useState('');
useEffect(() => {
  fetchData(query); // React will warn/bug out if query is not in the array
}, []); 

// CORRECT
useEffect(() => {
  fetchData(query);
}, [query]); // Exhaustive
```

### 3. Strict TypeScript Typing — MUST

Never use `any`. Always type your props, state, and API responses.

```tsx
// VIOLATION
const UserCard = (props: any) => { ... }
const [user, setUser] = useState(); // Inferred as undefined

// CORRECT
interface UserCardProps {
  id: string;
  name: string;
  isActive?: boolean; // Optional prop
}

const UserCard = ({ id, name, isActive = false }: UserCardProps) => { ... }

// Type state explicitly if it can be null initially
const [user, setUser] = useState<User | null>(null);
```

### 4. Custom Hooks for Logic — SHOULD

If a component has more than 3-4 hooks, extract the logic into a custom hook. UI components should focus on rendering.

```tsx
// BAD — UI component cluttered with fetching logic
const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);

  return <ProfileUI user={user} loading={loading} />;
}

// GOOD — extracted custom hook
const useUserProfile = () => {
  // Logic lives here (or better, use React Query)
  return { user, loading };
}

const ProfileScreen = () => {
  const { user, loading } = useUserProfile();
  return <ProfileUI user={user} loading={loading} />;
}
```

### 5. Boolean Coercion in JSX — MUST

React Native will crash if you try to render a raw string or number directly inside a View without a Text component, or if you evaluate an empty string in a logical AND.

```tsx
// VIOLATION — if string is '', it evaluates to '' and React Native crashes
{title && <Text>{title}</Text>}

// VIOLATION — if items.length is 0, it renders 0 (number) and crashes
{items.length && <Text>Has items</Text>}

// CORRECT — strictly coerce to boolean
{!!title && <Text>{title}</Text>}
{items.length > 0 && <Text>Has items</Text>}
{Boolean(items.length) && <Text>Has items</Text>}
```

### 6. Avoid `useEffect` for State Synchronization — SHOULD

```tsx
// BAD — synchronizing state via effect
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD — derive during render
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = `${firstName} ${lastName}`;
```

---

## Naming Conventions (React-Specific)

| Element                 | Convention            | Example                          |
| ----------------------- | --------------------- | -------------------------------- |
| Components              | `PascalCase`          | `UserProfile`, `SubmitButton`    |
| Component Files         | `PascalCase` or `kebab`| `UserProfile.tsx` or `user.tsx`  |
| Hooks                   | `use` prefix          | `useAuth`, `useFetchData`        |
| Prop Types              | `ComponentProps`      | `UserProfileProps`               |
| Event Handlers (Props)  | `on` prefix           | `onPress`, `onSubmit`            |
| Event Handlers (Local)  | `handle` prefix       | `handlePress`, `handleSubmit`    |
| Booleans                | `is`, `has`, `should` | `isLoading`, `hasError`          |

---

## Quality Checklist

- [ ] All hooks are called at the top level of the component.
- [ ] Dependency arrays for `useEffect`, `useCallback`, and `useMemo` are exhaustive.
- [ ] No `any` types used; props and state are strictly typed with interfaces/types.
- [ ] Component logic (data fetching, complex state) is extracted into custom hooks.
- [ ] Logical AND `&&` in JSX uses strict boolean coercion (`!!` or `> 0`) to prevent crashes.
- [ ] `useEffect` is not used to synchronize derived state.
- [ ] Naming conventions match React standards (`useX` for hooks, `PascalCase` for components).
