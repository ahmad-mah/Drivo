# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

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
