# Component Rules

## Purpose

Enforceable rules for building React Native components. These rules prevent common rendering bugs, maintain performance, and keep the UI layer readable.

---

## MUST Rules (Blocking)

### 1. Components MUST Be Pure Functions of Props and State

A component should return the exact same JSX given the exact same props and state. Do not mutate variables outside the component's scope during render.

```tsx
// VIOLATION — mutates an external variable during render
let renderCount = 0;
const BadComponent = () => {
  renderCount++; // Side effect during render!
  return <Text>{renderCount}</Text>;
}

// CORRECT
const GoodComponent = () => {
  return <Text>Hello</Text>; // Pure
}
```

### 2. Components MUST NOT Be Defined Inside Other Components

Defining a component inside another causes React to see it as a completely new component type on every render. It will unmount and remount, destroying its state and focus.

```tsx
// VIOLATION
const Parent = () => {
  // Created fresh every render of Parent
  const Child = () => <Text>Hello</Text>; 
  return <Child />;
}

// CORRECT
const Child = () => <Text>Hello</Text>; // Defined outside

const Parent = () => {
  return <Child />;
}
```

### 3. Lists MUST Use Unique `key` Props

When mapping over arrays to generate JSX, every item MUST have a unique, stable `key` prop attached to the topmost element returned by the map.

```tsx
// VIOLATION — no key, or using array index as key (bad for re-ordering)
{items.map((item, index) => (
  <Text key={index}>{item.name}</Text> 
))}

// CORRECT — using unique ID
{items.map(item => (
  <Text key={item.id}>{item.name}</Text>
))}
```

### 4. Default Exports MUST Be Used for Expo Router Screens

If using Expo Router, screen files inside the `app/` directory MUST export the component as the `default` export. 

```tsx
// app/index.tsx
// CORRECT
export default function HomeScreen() { ... }

// components/Button.tsx
// PREFER named exports for regular components
export const Button = () => { ... }
```

---

## SHOULD Rules (Recommended)

### 5. Props SHOULD Be Destructured in the Function Signature

```tsx
// NOT RECOMMENDED
const UserCard = (props: UserCardProps) => {
  return <Text>{props.name}</Text>;
}

// RECOMMENDED
const UserCard = ({ name, age, isActive = false }: UserCardProps) => {
  return <Text>{name}</Text>;
}
```

### 6. Components SHOULD Not Exceed 200-300 Lines

If a component file is growing massive, it is usually doing too much.
- Extract complex UI sections into smaller, dumb components.
- Extract complex logic into custom hooks.

### 7. Avoid Prop Drilling Deeply

If you are passing props down through 3 or 4 layers of components that don't use the props themselves, you should use Composition (passing `children`) or Global State (Zustand/Context).

```tsx
// NOT RECOMMENDED — Prop Drilling
const Screen = ({ user }) => <Header user={user} />;
const Header = ({ user }) => <Nav user={user} />;
const Nav = ({ user }) => <Avatar user={user} />;

// RECOMMENDED — Composition
const Screen = ({ user }) => (
  <Header>
    <Nav>
      <Avatar user={user} />
    </Nav>
  </Header>
);
```

### 8. Use `useCallback` for Functions Passed to Memoized Children

If a child component is wrapped in `React.memo` or is a `FlatList`/`FlashList`, any functions passed to it MUST be wrapped in `useCallback` to prevent breaking the memoization.

```tsx
const Parent = () => {
  // If not wrapped in useCallback, MemoizedButton re-renders every time Parent renders
  const handlePress = useCallback(() => {
    console.log('Pressed');
  }, []);

  return <MemoizedButton onPress={handlePress} />;
}
```

---

## Quality Checklist

- [ ] Components are pure and have no side effects during the render phase.
- [ ] No components are defined inside other components.
- [ ] Lists created via `.map()` have unique, stable `key` props (not array indices).
- [ ] Screen files (in Expo Router) use `export default`.
- [ ] Normal components use named exports `export const Name = ...`.
- [ ] Props are destructured in the function signature.
- [ ] Component size is reasonable (< 300 lines).
- [ ] Prop drilling is minimized via composition (`children`) or global state.
- [ ] Callbacks passed to pure/memoized children use `useCallback`.
