# React Native Bug Fixing Workflow

## Base Workflow
Follow `workflows/bug-investigation.md` as the foundation. This document adds React Native-specific debugging techniques.

---

## React Native Debugging Tools

### Expo Go vs Custom Dev Client

| Environment         | What it is                             | Debugging Caveats                       |
| ------------------- | -------------------------------------- | --------------------------------------- |
| **Expo Go**         | Pre-compiled sandbox app               | Cannot debug custom native modules      |
| **Dev Client**      | Your actual app built in debug mode    | Requires running a local native build   |

Always try to debug in a Dev Client (`npx expo run:ios` / `run:android`) to ensure native modules aren't causing the issue.

### Debugging Interfaces

- **Chrome DevTools (Hermes Debugger):** Used for stepping through JS code, inspecting `console.log`, and profiling JS performance.
- **React DevTools:** Used for inspecting the component tree, checking props/state, and profiling re-renders.
- **React Query DevTools:** Used for inspecting API cache, forcing refetches, and checking query states.

---

## React Native-Specific Debugging Steps

### Layout & Styling Issues (iOS vs Android)

```
1. Symptom: Text is cut off on Android but fine on iOS.
   Fix: Android handles line height and fonts differently. Check if a fixed height is restricting the Text component.

2. Symptom: Content goes under the notch or home indicator.
   Fix: Ensure the screen is wrapped in <SafeAreaView> from react-native-safe-area-context.

3. Symptom: Keyboard covers the text input.
   Fix: Wrap the screen in <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>.
```

### State & Re-render Issues

```
1. Symptom: The app is extremely slow when typing in a TextInput.
   Diagnosis: The TextInput state change is causing the entire screen to re-render.
   Fix: Isolate the TextInput into its own component, or use React Hook Form so the whole screen doesn't depend on the text state.

2. Symptom: FlatList is jumping or stuttering.
   Diagnosis: Components inside the list are losing their state because `key` is missing or based on Math.random().
   Fix: Ensure `keyExtractor` returns a stable, unique ID.

3. Symptom: useEffect runs infinitely.
   Diagnosis: An object or array is in the dependency array, and it's being recreated every render.
   Fix: Wrap the object/array in useMemo, or move its declaration outside the component.
```

### Network & Data Issues

```
1. Symptom: API call works in browser/Postman but fails in React Native.
   Diagnosis: iOS blocks non-HTTPS (HTTP) requests by default (App Transport Security). Android 9+ also blocks cleartext traffic.
   Fix: Use HTTPS, or configure network security exceptions (for local dev).

2. Symptom: Data is stale when navigating back to a screen.
   Diagnosis: React Navigation does not unmount screens when pushing new ones on top of the stack.
   Fix: Use React Query (it auto-refetches on window focus), or use `useFocusEffect` to trigger refetches.
```

---

## Bug Fix Verification

After fixing a React Native bug, additionally verify:

- [ ] Fix works on iOS Simulator.
- [ ] Fix works on Android Emulator.
- [ ] Open the in-app developer menu (`Cmd+D` or `m` in terminal) and toggle the Element Inspector to ensure no layout boundaries are broken.
- [ ] Test the fix with the keyboard open.
- [ ] Ensure the fix does not introduce infinite re-render loops (check React DevTools Profiler).

---

## Quick Diagnostic Reference

```
"My app crashed on startup (white screen)" → Usually a JS syntax error or a missing native module (did you prebuild?).
"Screen flickers when loading"             → State is out of sync; useEffect is setting state after render. Use derived state.
"Can't tap button behind absolute view"    → The absolute view is blocking touches. Add `pointerEvents="none"` to it.
"Images take forever to load"              → Switch to `expo-image` and ensure proper caching policies.
"Works in Expo Go, crashes in standalone"  → You added a package with native code. You must build a custom Dev Client.
```
