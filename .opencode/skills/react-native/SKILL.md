---
name: react-native
description: Use when building React Native features, screen layouts, navigation patterns, or using Expo APIs.
---

# Skill: React Native

This skill provides React Native and Expo-specific guidelines, based on Expo SDK 56 and React Native 0.85.

## Rules
1. **Expo Router for Navigation**: Use file-based routing with Expo Router. Place routes in `src/app/` directory. Use `(group)` folder naming for tab and stack groups. Use `<Link>` for declarative navigation.
2. **Reanimated for Animations**: Use `react-native-reanimated` v4 for all animation work. Prefer `useSharedValue`, `useAnimatedStyle`, and `withTiming`/`withSpring` over the standard `Animated` API.
3. **Screens and Platform Components**: Use `react-native-screens` for native screen optimization. Use `react-native-safe-area-context` for safe area insets.
4. **Gesture Handler for Touch**: Use `react-native-gesture-handler` for gesture-based interactions. Wrap root component with `GestureHandlerRootView`.
5. **Expo UI Components**: Prefer `@expo/ui` components for building native-feeling interfaces.
6. **Fonts & Symbols**: Use `expo-font` for custom fonts and `expo-symbols` for SF Symbols on iOS.

## Workflow
1. **Create Route File**: Add screen at `src/app/(group)/screen-name.tsx`.
2. **Define Layout**: If needed, add `_layout.tsx` for stack/tab configuration.
3. **Build UI**: Use React Native components with StyleSheet or `@expo/ui` components.
4. **Add Business Logic**: Create custom hooks in `src/hooks/` or a `src/domain/` directory.
5. **Style**: Use `StyleSheet.create` for static styles; inline styles for dynamic values.

## Checklists
- [ ] Routes follow Expo Router conventions (file-based, layouts).
- [ ] Animations use Reanimated, not Animated API.
- [ ] SafeAreaView / SafeAreaProvider is used where appropriate.
- [ ] Gesture handling uses Gesture Handler components.
- [ ] Images use `expo-image` for optimized loading (caching, blurhash).
- [ ] Platform-specific code uses `Platform.OS` constants, not `react-native-web` shims.

## Common Mistakes
- **Expo Router v2/v3 Confusion**: Using `app/` inside `src/app/` when Expo Router expects `src/app/` as the root. Ensure `app.json` or `tsconfig` paths match.
- **Reanimated Worklet Errors**: Calling non-worklet functions from `'worklet'` context. Use `runOnJS` to call JS functions from animations.
- **Over-rendering with Inline Functions**: Defining callbacks inline in JSX causing unnecessary re-renders. Use `useCallback` or store handlers in shared objects.

## Validation Steps
1. Run `npx expo start --clear` and verify app loads without errors.
2. Test on both iOS simulator and Android emulator when possible.
3. Verify navigation flows work correctly (auth → home, deep links).
