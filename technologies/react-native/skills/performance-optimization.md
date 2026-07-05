# Performance Optimization

## 1. Load Conditions
- **Trigger**: Rendering lists, writing animations, handling heavy component re-renders.
- **Prerequisites**: `react-native/rules/performance-rules.md`

## 2. Core Directives
- **List Dominance**: NEVER use `ScrollView` for lists with >20 items. MUST use `@shopify/flash-list` (preferred) or `FlatList`.
- **UI Thread Animations**: JS-driven animations (`Animated.timing`) drop frames. MUST use `react-native-reanimated` (runs on UI thread).
- **Stable References**: Arrays, objects, and functions passed to children MUST be memoized if the child is wrapped in `React.memo`.

## 3. Implementation Workflow

### Step 1: High-Performance Lists (FlashList)
```tsx
import { FlashList } from '@shopify/flash-list';

// MUST provide estimatedItemSize
<FlashList
  data={massiveArray}
  renderItem={({ item }) => <ListItem item={item} />}
  estimatedItemSize={50} // Crucial for performance
/>
```

### Step 2: Extracting Functions from Lists
Never define inline functions inside a `renderItem` or heavy list component.
```tsx
// ❌ ANTI-PATTERN: New function created every scroll frame
<FlatList renderItem={({item}) => <Button onPress={() => doSomething(item)} />} />

// ✅ CORRECT: Memoized callback
const renderItem = useCallback(({ item }) => <MemoizedButton item={item} />, []);
```

### Step 3: Fast Images
React Native's built-in `<Image>` does not cache efficiently. Use `expo-image`.
```tsx
import { Image } from 'expo-image';

<Image 
  source="https://example.com/huge-image.jpg" 
  contentFit="cover" 
  cachePolicy="memory-disk" 
/>
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| `ScrollView` for dynamic lists | Loads all elements into memory immediately. OOM crash. Use `FlashList`. |
| Inline Objects `style={{ flex: 1 }}` | Breaks `React.memo` by changing reference every render. Extract to `StyleSheet`. |
| `console.log` in production | Degrades performance. MUST be stripped using babel plugins or avoided. |

## 5. Verification Checklist
- [ ] `@shopify/flash-list` used for long lists.
- [ ] Inline arrow functions avoided in list rendering.
- [ ] `expo-image` used for network images.
- [ ] `react-native-reanimated` used for animations instead of built-in `Animated`.
