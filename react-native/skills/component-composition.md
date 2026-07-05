# Component Composition

## 1. Load Conditions
- **Trigger**: Creating UI components, building screens, extracting duplicated code.
- **Prerequisites**: `react-native/rules/component-rules.md`

## 2. Core Directives
- **Composition over Props**: Avoid "prop drilling" (passing props down 5 levels). Use the `children` prop to pass components directly.
- **Never Nest Declarations**: NEVER declare a component inside another component's render body. It causes catastrophic unmounting and re-rendering.
- **Purity**: Components MUST be pure functions with respect to their props.

## 3. Implementation Workflow

### Step 1: Use the `children` Prop
Instead of passing data, pass UI.
```tsx
// ❌ ANTI-PATTERN: Prop Drilling
<Card title="Hello" content="World" footerText="Click Me" />

// ✅ CORRECT: Composition
<Card>
  <CardHeader>Hello</CardHeader>
  <CardContent>World</CardContent>
  <CardFooter>Click Me</CardFooter>
</Card>
```

### Step 2: Separate State from UI (Container/Presenter)
```tsx
// Container handles hooks/data
export const UserProfileContainer = () => {
  const { data, isLoading } = useUserQuery();
  if (isLoading) return <Spinner />;
  return <UserProfile user={data} />;
};

// Presenter handles only UI
export const UserProfile = ({ user }: { user: User }) => (
  <View><Text>{user.name}</Text></View>
);
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Component inside Component | React destroys the inner component on every render. Move the inner component OUTSIDE the parent scope. |
| Massive files | If a component is > 150 lines of JSX, extract sub-components into their own files. |
| Over-using `React.memo` | Only memoize heavy components (like list items). Memoizing everything degrades performance due to prop-checking overhead. |

## 5. Verification Checklist
- [ ] No components are declared inside another component's body.
- [ ] Complex prop drilling is replaced with `children` composition.
- [ ] UI components are decoupled from data-fetching logic (where applicable).
