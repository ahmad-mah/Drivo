# Styling & Layout

## 1. Load Conditions
- **Trigger**: Building UI, positioning elements, supporting Dark Mode, handling notches.
- **Prerequisites**: `react-native/rules/component-rules.md`

## 2. Core Directives
- **Flexbox Exclusivity**: ALL layouts MUST use Flexbox. React Native does not support CSS Grid, float, or block layouts.
- **NativeWind / Tailwind**: Prefer NativeWind utility classes (`className="flex-1 items-center"`) over `StyleSheet.create` for speed and consistency.
- **Safe Areas**: MUST use `SafeAreaView` or `useSafeAreaInsets` to prevent UI from hiding behind notches or home indicators.

## 3. Implementation Workflow

### Step 1: Layout with Flexbox (NativeWind)
```tsx
// Centers content both vertically and horizontally
<View className="flex-1 items-center justify-center bg-white dark:bg-black">
  <Text className="text-xl font-bold text-gray-900 dark:text-white">
    Hello
  </Text>
</View>
```

### Step 2: Handling Safe Areas (Insets)
Use `react-native-safe-area-context` instead of the default React Native component for better performance and flexibility.
```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const CustomHeader = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }} className="bg-blue-500">
      <Text>Header</Text>
    </View>
  );
};
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Inline Styles | Creates a new object every render. Use `className` (NativeWind) or `StyleSheet`. |
| Hardcoded Margins for Notches | Fails on different devices. MUST use `useSafeAreaInsets()`. |
| Absolute Positioning for Layout | Breaks on different screen sizes. Use Flexbox `justifyContent`/`alignItems`. |
| Missing Platform Checks | iOS shadows use `shadowColor`, Android uses `elevation`. Handle accordingly. |

## 5. Verification Checklist
- [ ] Flexbox is used for primary layout structure.
- [ ] NativeWind `className` is preferred; inline styles `style={{}}` are avoided unless dynamic.
- [ ] Top and Bottom safe areas are accounted for on all full-screen layouts.
- [ ] Dark mode is supported via `dark:` NativeWind variants.
