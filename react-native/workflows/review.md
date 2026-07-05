# React Native Code Review Checklist

## Base Workflow
Follow `rules/code-review-standards.md` for general review process. This document adds React Native-specific review criteria.

---

## React Native Review Checklist

### Component Quality

- [ ] Components are pure functions of props and state.
- [ ] No components are defined inside other components.
- [ ] Props are strictly typed using TypeScript `interface` or `type` (no `any`).
- [ ] Destructuring is used for props in the function signature.
- [ ] Logic-heavy components have their logic extracted into custom hooks.
- [ ] Component files are a reasonable size (< 300 lines).

### React Hooks & State

- [ ] Hooks are only called at the top level (not in conditionals or loops).
- [ ] `useEffect`, `useCallback`, and `useMemo` dependency arrays are exhaustive.
- [ ] `useEffect` is NOT used to synchronize derived state (state that can be calculated during render).
- [ ] Cleanup functions are provided in `useEffect` when setting up subscriptions or timers.
- [ ] API data fetching uses React Query (or similar), not manual `useEffect` + `setState`.
- [ ] Global state (Zustand/Context) uses selective rendering (selectors) to prevent unnecessary re-renders.

### Performance

- [ ] `FlashList` (or `FlatList`) is used for arrays of data, NEVER `ScrollView` with `.map()`.
- [ ] `renderItem` functions are extracted and wrapped in `useCallback`.
- [ ] Objects or functions passed as props to `React.memo` or lists are memoized (`useMemo`/`useCallback`).
- [ ] Animations use `react-native-reanimated` (UI thread), not React state.
- [ ] Network images use `expo-image` (or `FastImage`) with proper caching policies.

### Styling & Layout

- [ ] Layouts use Flexbox; absolute positioning is used sparingly.
- [ ] Inline style objects (e.g., `style={{ margin: 10 }}`) are avoided in favor of `StyleSheet.create` or Tailwind/NativeWind classes.
- [ ] `SafeAreaView` or `useSafeAreaInsets` is used to prevent overlap with iOS notches/Android status bars.
- [ ] `KeyboardAvoidingView` or similar is used to ensure text inputs aren't covered by the keyboard.

### Navigation & Routing (Expo Router / React Navigation)

- [ ] Complex objects are NOT passed as navigation parameters (only IDs or primitives).
- [ ] Expo Router files in `app/` use `export default`.
- [ ] Navigation hooks (`useLocalSearchParams`, `useRoute`) are strictly typed.

---

## Red Flags (Blocking Issues)

| Red Flag                                    | Why It Blocks                             |
| ------------------------------------------- | ----------------------------------------- |
| Components defined inside components        | Unmounts/remounts completely on every render, losing focus/state |
| Missing keys in mapped lists                | Destroys component identity during re-orders |
| Non-exhaustive hook dependencies            | Causes stale closures and hard-to-track bugs |
| Animating layout via `setState`             | Clogs JS thread, causing severe UI jank |
| Passing objects in navigation params        | Breaks deep linking and web URLs |
| No TypeScript types (`any`)                 | Defeats the purpose of using TS |

---

## Green Flags (Praise-Worthy)

| Green Flag                                  | Why It's Good                             |
| ------------------------------------------- | ----------------------------------------- |
| Extracted custom hooks for business logic   | Keeps UI components clean and testable    |
| Using `useMemo` for derived heavy computations | Prevents unnecessary CPU work             |
| Accessible UI (roles, labels)               | App is usable by screen readers (and easily testable via RNTL) |
| Handling loading/empty/error states gracefully| Excellent UX, prevents blank screens      |
