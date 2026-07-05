# Platform Integration

## When to Load
- Accessing device sensors, camera, or file system
- Calling native platform APIs
- Creating or consuming platform plugins
- Handling platform-specific behavior (Android vs iOS)

## Prerequisites
- `flutter/rules/dart-idioms.md`
- `flutter/skills/async-patterns.md`

---

## Core Concepts

### Platform Channels

Communication between Dart and native code uses message-passing channels.

```
Dart (Flutter)  ←→  Platform Channel  ←→  Native (Android/iOS)
     │                                           │
  MethodChannel ────── Method calls ──────► Native handler
  EventChannel  ◄───── Event stream ──────  Native sender
```

### When to Use Platform Channels

| Scenario                          | Approach                              |
| --------------------------------- | ------------------------------------- |
| Functionality already in a plugin | Use the existing plugin               |
| Simple one-shot native call       | `MethodChannel`                       |
| Continuous native data stream     | `EventChannel`                        |
| Complex native UI                 | `PlatformView` (use sparingly)        |
| Background work                   | Platform-specific background service  |

---

## Workflow

### 1. Check for Existing Plugins First

Before writing platform-specific code, check pub.dev:

```
1. Search pub.dev for the capability you need
2. Evaluate: federated plugin > single plugin > custom channel
3. Check plugin scorecard: likes, popularity, maintenance
4. Verify platform support (Android, iOS, Web, Desktop)
```

### 2. Using MethodChannel

```dart
// Dart side
class BatteryService {
  static const _channel = MethodChannel('com.example.app/battery');

  Future<int> getBatteryLevel() async {
    try {
      final level = await _channel.invokeMethod<int>('getBatteryLevel');
      return level ?? 0;
    } on PlatformException catch (e) {
      throw BatteryException('Failed to get battery level: ${e.message}');
    }
  }
}

// Always wrap in a service class with proper error handling
// Never call MethodChannel directly from widgets
```

### 3. Platform-Aware UI

```dart
// Use Platform checks for behavior, not UI
import 'dart:io' show Platform;

// For behavior differences
if (Platform.isIOS) {
  // Use iOS-specific haptic feedback
} else if (Platform.isAndroid) {
  // Use Android-specific vibration
}

// For UI, use adaptive widgets
showDialog(
  context: context,
  builder: (_) => AlertDialog.adaptive(
    title: const Text('Confirm'),
    content: const Text('Are you sure?'),
    actions: [
      adaptiveAction(context, 'Cancel', () => Navigator.pop(context)),
      adaptiveAction(context, 'OK', () => _confirm()),
    ],
  ),
);

// For platform-aware widgets
Switch.adaptive(value: _value, onChanged: _onChanged);
```

### 4. Permissions Handling

```dart
// Always check and request permissions before using platform features
Future<bool> requestCameraPermission() async {
  var status = await Permission.camera.status;

  if (status.isGranted) return true;

  if (status.isDenied) {
    status = await Permission.camera.request();
    return status.isGranted;
  }

  if (status.isPermanentlyDenied) {
    // Direct user to app settings
    await openAppSettings();
    return false;
  }

  return false;
}

// Pattern: check → request → handle denial gracefully
Future<void> takePhoto() async {
  final hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    showPermissionDeniedDialog();
    return;
  }
  // Proceed with camera
}
```

---

## Best Practices

1. **Use existing plugins** before writing custom platform code
2. **Wrap platform calls in service classes** — never call from widgets
3. **Handle `PlatformException`** on every channel call
4. **Request permissions gracefully** — explain why, handle denial
5. **Test platform code on real devices** — emulators miss edge cases
6. **Use `defaultTargetPlatform`** for UI adaptation — testable, unlike `Platform`
7. **Use federated plugins** for multi-platform packages

---

## Common Mistakes

| Mistake                              | Why It's Wrong                            | Fix                                        |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------ |
| Not handling `PlatformException`     | Crash on native failures                  | Catch and convert to domain errors         |
| Platform calls directly in widgets   | Untestable, coupled                       | Wrap in service classes                    |
| Not requesting permissions           | Crash or silent failure on first use      | Always check and request before using      |
| Assuming all platforms behave same   | Platform-specific bugs                    | Test on each target platform               |
| Using `Platform.isX` in tests        | Tests fail on wrong platform              | Use `defaultTargetPlatform` and override   |

---

## Verification Checklist

- [ ] Existing plugins are used before writing custom platform code
- [ ] All platform calls are wrapped in service/repository classes
- [ ] `PlatformException` is caught and converted to domain errors
- [ ] Permissions are checked and requested before platform features
- [ ] Permission denial is handled gracefully with user-facing explanation
- [ ] Platform-specific behavior uses `defaultTargetPlatform` (testable)
- [ ] Platform code is tested on real devices for each target platform
- [ ] Channel names follow reverse-domain convention (`com.example.app/feature`)
- [ ] No platform-specific imports in business logic layer
- [ ] Fallback behavior exists for unsupported platforms
