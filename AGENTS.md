# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Screen Refactoring Pattern

When cleaning up or building a screen, always follow this pattern:

1. **Extract UI into small components** — each component gets its own file (e.g. `SkipButton`, `NextButton`, `OnboardingDots`, `OnboardingSwiper`)
2. **Move state + logic into a custom hook** — create `screens/useX.ts` or `hooks/useX.ts` that encapsulates all state, refs, and handlers
3. **Screen becomes pure wiring** — the screen file only calls the hook and arranges components in JSX; no inline logic, no large JSX blocks

```
Feature/
├── components/    ← reusable UI pieces
├── hooks/         ← state/logic extracted from screen
├── screens/       ← thin composition layer (hook + JSX)
└── constants/     ← static data, types, enums
```

- Components receive props only — no direct state or ref management unless self-contained
- Hooks own all screen-level state, refs, derived values, and event handlers
- Screens do not contain business logic or complex inline handlers

## Splash Screen + Font Loading Pattern

Always use this pattern for splash screen and font loading:

```tsx
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync(); // MUST be at module scope, never inside a component

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({ ... });
      } catch {
        // fonts failed — app still renders
      } finally {
        await SplashScreen.hideAsync();
        setReady(true);
      }
    }
    prepare();
  }, []);

  if (!ready) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- `preventAutoHideAsync()` at module scope, not inside a component (calling it too late = black screen)
- `Font.loadAsync()` over `useFonts` hook for explicit control
- No `return null` before fonts — splash handles the waiting period
- `finally` block ensures app renders even if fonts fail
