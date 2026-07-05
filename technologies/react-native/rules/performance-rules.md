# React Native Performance Rules

## Purpose

Enforceable performance rules for React Native applications to ensure 60fps scrolling, minimal battery drain, and fast interaction times.

---

## Render Budgets & Optimization — MUST

### 1. Do Not Pass Inline Functions/Objects to Memoized Components

If a child is a `FlatList`, `FlashList`, or wrapped in `React.memo`, passing an inline object or function will destroy the memoization, causing re-renders every time the parent renders.

```tsx
// VIOLATION
<MemoizedCard 
  style={{ margin: 10 }} // New reference every render!
  onPress={() => doSomething()} // New reference every render!
/>

// CORRECT
const cardStyle = { margin: 10 }; // Declared outside or useMemo

const Parent = () => {
  const handlePress = useCallback(() => doSomething(), []);
  return <MemoizedCard style={cardStyle} onPress={handlePress} />;
}
```

### 2. Large Lists MUST Use FlashList

Never use `ScrollView` for mapping over large arrays. Never use `FlatList` if the array exceeds ~20-30 complex items. Use `@shopify/flash-list`.

```tsx
// VIOLATION
<ScrollView>
  {items.map(item => <Item key={item.id} />)}
</ScrollView>

// CORRECT
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100} // MUST provide this for performance
/>
```

---

## Image Optimization — MUST

### 3. Resize Images and Use Cache

Standard `<Image>` components from `react-native` download full-resolution images and cache them poorly. This causes Out Of Memory (OOM) crashes on low-end Androids.

```tsx
// VIOLATION
import { Image } from 'react-native';
<Image source={{ uri: largeImageUrl }} style={{ width: 50, height: 50 }} />

// CORRECT
import { Image } from 'expo-image';
<Image 
  source={largeImageUrl} 
  style={{ width: 50, height: 50 }} 
  cachePolicy="memory-disk"
/>
```

---

## Animation Rules — MUST

### 4. Animations MUST Run on the UI Thread

Animating width, height, or margin using React state (`setState`) forces the JS thread to calculate every frame, causing severe stuttering (jank).

```tsx
// VIOLATION — React State Animation (JS Thread)
const [width, setWidth] = useState(100);
// setInterval or requestAnimationFrame setting state...
<View style={{ width }} />

// CORRECT — Reanimated (UI Thread)
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const width = useSharedValue(100);
const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));

// Trigger: width.value = withTiming(200);
<Animated.View style={animatedStyle} />
```

---

## Architecture Rules — SHOULD

### 5. Prevent Unnecessary Re-renders with Global State

When using Zustand, do not select the entire store. Select only the specific slice of state the component needs. If you select the whole store, the component re-renders when ANY store value changes.

```tsx
// VIOLATION
const store = useUserStore(); // Re-renders if store.theme changes, even if we only need store.name
return <Text>{store.name}</Text>;

// CORRECT
const name = useUserStore(state => state.name); // Only re-renders if name changes
return <Text>{name}</Text>;
```

### 6. Avoid Heavy Computation in Render

If you must filter or sort a large array, wrap it in `useMemo`.

```tsx
// VIOLATION — sorts array on EVERY render (e.g., when a text input changes)
const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));

// CORRECT
const sortedUsers = useMemo(() => {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

---

## Quality Checklist

- [ ] Inline functions/objects are avoided when passing props to `FlatList`, `FlashList`, or `React.memo` components.
- [ ] `FlashList` is used for lists larger than 20 items, with `estimatedItemSize` provided.
- [ ] `expo-image` is used for all network images.
- [ ] Continuous animations (drags, physics, interpolations) use `react-native-reanimated`.
- [ ] Zustand/Global state selectors are specific (not returning the whole store).
- [ ] Heavy data transformations in components are wrapped in `useMemo`.
