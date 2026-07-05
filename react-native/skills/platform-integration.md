# Platform Integration

## 1. Load Conditions
- **Trigger**: Accessing native device APIs (camera, location), handling iOS vs Android UI differences, configuring Expo prebuild.
- **Prerequisites**: `react-native/rules/project-structure.md`

## 2. Core Directives
- **Expo Modules First**: Always look for an `expo-*` package before using a community `react-native-*` package.
- **Avoid Bare Workflow**: NEVER eject from Expo. Use Config Plugins to modify native Android/iOS code during `prebuild`.
- **Platform Specificity**: iOS and Android have different UI paradigms (shadows, ripples, pickers). Explicit checks (`Platform.OS`) are often necessary.

## 3. Implementation Workflow

### Step 1: Platform-Specific Styling
```tsx
import { Platform, View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    // iOS shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 3, // Android shadow
      },
    }),
  },
});
```

### Step 2: Config Plugins (app.json)
Instead of modifying `AndroidManifest.xml` or `Info.plist` manually, define them in `app.json`.
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow app to use location."
        }
      ]
    ]
  }
}
```

### Step 3: Keyboard Handling
The keyboard behaves differently on iOS and Android.
```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView 
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  {/* Content */}
</KeyboardAvoidingView>
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| Modifying `/ios` or `/android` folders directly | Will be wiped on next `npx expo prebuild`. Use Config Plugins. |
| Forgetting Android permissions | App will crash when accessing camera/location. Define in `app.json`. |
| Assuming UI renders identically | Text vertical alignment, shadows, and ripples differ natively. Always test both. |

## 5. Verification Checklist
- [ ] Native dependencies use Expo Config Plugins.
- [ ] No manual edits made to `android/` or `ios/` folders.
- [ ] `Platform.select()` used for divergent styling (shadows/elevation).
- [ ] `KeyboardAvoidingView` behavior configured correctly per platform.
