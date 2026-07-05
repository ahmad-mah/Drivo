# Navigation & Routing (Expo Router)

## 1. Load Conditions
- **Trigger**: Adding new screens, passing data between screens, handling deep links.
- **Prerequisites**: `react-native/rules/project-structure.md`

## 2. Core Directives
- **File-Based Routing**: MUST use Expo Router. The folder structure in `app/` dictates the URL paths.
- **No Object Passing**: NEVER pass large objects via routing parameters. Pass ONLY primitive IDs and fetch the data on the target screen.
- **Feature Separation**: Screens in `app/` MUST act only as thin wrappers. The actual UI code MUST live in `src/features/`.

## 3. Implementation Workflow

### Step 1: Define the Route
Create a file in the `app/` directory.
```tsx
// app/users/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { UserProfileScreen } from '@/features/users/UserProfileScreen';

export default function UserRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <UserProfileScreen userId={id} />;
}
```

### Step 2: Navigate
Use the `Link` component or the `router` object.
```tsx
import { Link, router } from 'expo-router';

// Declarative
<Link href={`/users/${userId}`}>View User</Link>

// Imperative
<Button onPress={() => router.push(`/users/${userId}`)} />
```

### Step 3: Layouts
Use `_layout.tsx` to define shared UI (Stacks, Tabs).
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="users/[id]" options={{ title: 'User Profile' }} />
    </Stack>
  );
}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| `router.push({ pathname: '/user', params: { userObj: ... } })` | Params must be strings. Pass ID, use React Query on target screen. |
| Massive code in `app/` files | `app/` files are just route definitions. UI logic belongs in `src/`. |
| Missing deep link config | Expo Router handles deep linking automatically based on file structure. |

## 5. Verification Checklist
- [ ] Route files reside strictly in the `app/` directory.
- [ ] Route parameters are strings/primitives, never objects.
- [ ] Complex UI logic is imported from `src/features/`, not written inline in the route file.
