# React Native Refactoring Workflow

## Base Workflow
Follow `workflows/refactoring.md` as the foundation. This document adds React Native-specific refactoring patterns.

---

## Common React Native Refactorings

### 1. Extract Custom Hook

**When:** A component has too many `useState` and `useEffect` calls, making the UI hard to read.

```tsx
// BEFORE — Component bloated with logic
const UserScreen = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  return <Text>{user.name}</Text>;
}

// AFTER — Logic extracted to a hook (or better, replaced by React Query)
const useUser = (userId) => {
  // Logic lives here
  return { user, loading, error };
}

const UserScreen = ({ userId }) => {
  const { user, loading, error } = useUser(userId);
  if (loading) return <Spinner />;
  return <Text>{user.name}</Text>;
}
```

### 2. Move Inline Functions out of Render (for Lists)

**When:** A `FlatList` or `FlashList` is re-rendering all items because the `renderItem` function is defined inline.

```tsx
// BEFORE — renderItem recreated every render of Screen
const Screen = () => {
  const [count, setCount] = useState(0); // Changes here cause list to re-render!

  return (
    <FlashList 
      data={items} 
      renderItem={({ item }) => <Card item={item} onPress={() => navigate(item.id)} />} 
    />
  );
}

// AFTER — useCallback preserves the function reference
const Screen = () => {
  const [count, setCount] = useState(0);
  
  const handlePress = useCallback((id) => navigate(id), []);
  const renderItem = useCallback(({ item }) => <Card item={item} onPress={handlePress} />, [handlePress]);

  return <FlashList data={items} renderItem={renderItem} />;
}
```

### 3. Replace Prop Drilling with Composition

**When:** You are passing props through multiple components that don't use them, just to reach a deeply nested child.

```tsx
// BEFORE
const Screen = () => <Layout user={user} theme={theme} />;
const Layout = ({ user, theme }) => <Header user={user} theme={theme} />;
const Header = ({ user, theme }) => <Avatar user={user} color={theme.primary} />;

// AFTER
const Screen = () => (
  <Layout>
    <Header>
      <Avatar user={user} color={theme.primary} />
    </Header>
  </Layout>
);

const Layout = ({ children }) => <View>{children}</View>;
const Header = ({ children }) => <View>{children}</View>;
```

### 4. Switch to React Query for Data Fetching

**When:** You find `useEffect` fetching logic spread throughout the app, causing race conditions or missing cache features.

**Steps:**
1. Identify `useState` + `useEffect` fetch blocks.
2. Create a React Query wrapper hook (`useItems`).
3. Replace the local state with the hook output (`data, isLoading`).
4. Remove the old state and effect.

---

## React Native-Specific Safety Rules

1. **Check TypeScript errors first:** After extracting components/hooks, ensure interfaces match perfectly.
2. **Beware of missing dependencies:** When extracting logic to `useCallback` or `useEffect`, ensure you haven't missed any variables in the dependency array (eslint `react-hooks/exhaustive-deps` will help).
3. **Verify list scrolling:** Refactoring lists often accidentally breaks memoization. Scroll the list after refactoring to check for stuttering.

---

## Verification

- [ ] TypeScript compiler shows 0 errors (`tsc --noEmit`).
- [ ] ESLint shows 0 warnings for `react-hooks/exhaustive-deps`.
- [ ] Custom hooks are separated into `src/hooks/` or `src/features/.../api/`.
- [ ] Extracted components are typed via `interface`.
- [ ] App compiles and runs without red screens.
