# Theming & Styling

## When to Load
- Setting up the app's design system
- Creating or modifying themes
- Building responsive layouts
- Working with typography, colors, or spacing

## Prerequisites
- `flutter/skills/widget-composition.md`
- `flutter/rules/dart-idioms.md`

---

## Core Concepts

### Material 3 Theme System

Flutter's theming is built around Material 3. Define themes once, reference everywhere via `Theme.of(context)`.

```dart
// Define your theme — single source of truth
class AppTheme {
  static ThemeData light() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF1A73E8),
      brightness: Brightness.light,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: _buildTextTheme(colorScheme),
      inputDecorationTheme: _buildInputTheme(colorScheme),
      elevatedButtonTheme: _buildButtonTheme(colorScheme),
      cardTheme: const CardThemeData(
        elevation: 0,
        margin: EdgeInsets.zero,
      ),
    );
  }

  static ThemeData dark() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF1A73E8),
      brightness: Brightness.dark,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      textTheme: _buildTextTheme(colorScheme),
      inputDecorationTheme: _buildInputTheme(colorScheme),
      elevatedButtonTheme: _buildButtonTheme(colorScheme),
    );
  }

  static TextTheme _buildTextTheme(ColorScheme scheme) {
    return TextTheme(
      headlineLarge: TextStyle(
        fontWeight: FontWeight.bold,
        color: scheme.onSurface,
      ),
      // Define only overrides — Material 3 provides sensible defaults
    );
  }
}
```

### Using Theme Values — Never Hardcode

```dart
// BAD — hardcoded colors and sizes
Container(
  color: Color(0xFF1A73E8),
  padding: EdgeInsets.all(16),
  child: Text(
    'Hello',
    style: TextStyle(fontSize: 24, color: Colors.white),
  ),
)

// GOOD — theme-driven
Container(
  color: Theme.of(context).colorScheme.primary,
  padding: const EdgeInsets.all(16),
  child: Text(
    'Hello',
    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
      color: Theme.of(context).colorScheme.onPrimary,
    ),
  ),
)

// BEST — extract a reference for readability
@override
Widget build(BuildContext context) {
  final theme = Theme.of(context);
  final colors = theme.colorScheme;
  final text = theme.textTheme;

  return Container(
    color: colors.primary,
    padding: const EdgeInsets.all(16),
    child: Text('Hello', style: text.headlineSmall?.copyWith(
      color: colors.onPrimary,
    )),
  );
}
```

---

## Workflow

### 1. Define a Spacing & Sizing System

```dart
// app_spacing.dart — consistent spacing throughout the app
abstract final class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;

  // Convenient EdgeInsets
  static const allSm = EdgeInsets.all(sm);
  static const allMd = EdgeInsets.all(md);
  static const allLg = EdgeInsets.all(lg);

  static const horizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const verticalSm = EdgeInsets.symmetric(vertical: sm);
}

// Usage
Padding(
  padding: AppSpacing.allMd,  // Consistent, not magic numbers
  child: Column(
    spacing: AppSpacing.sm,  // Flutter 3.27+ Column/Row spacing
    children: [/* ... */],
  ),
);
```

### 2. Responsive Design

```dart
// Use LayoutBuilder or MediaQuery for responsive layouts
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({
    super.key,
    required this.mobile,
    required this.tablet,
    this.desktop,
  });

  final Widget mobile;
  final Widget tablet;
  final Widget? desktop;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1200 && desktop != null) {
          return desktop!;
        }
        if (constraints.maxWidth >= 600) {
          return tablet;
        }
        return mobile;
      },
    );
  }
}

// Use MediaQuery for device-specific info (screen size, text scale)
final screenWidth = MediaQuery.sizeOf(context).width;
final textScale = MediaQuery.textScaleFactorOf(context);
final padding = MediaQuery.paddingOf(context); // Safe area

// IMPORTANT: Use specific MediaQuery methods to avoid unnecessary rebuilds
// BAD:  MediaQuery.of(context).size.width  — rebuilds on ANY MediaQuery change
// GOOD: MediaQuery.sizeOf(context).width   — rebuilds only on size change
```

### 3. Custom Component Themes

```dart
// For app-specific components, create extension themes
class AppButtonStyle {
  static ButtonStyle primary(ColorScheme colors) => ElevatedButton.styleFrom(
    backgroundColor: colors.primary,
    foregroundColor: colors.onPrimary,
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  );

  static ButtonStyle secondary(ColorScheme colors) => OutlinedButton.styleFrom(
    foregroundColor: colors.primary,
    side: BorderSide(color: colors.outline),
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  );
}
```

### 4. Dark Mode Support

```dart
MaterialApp(
  theme: AppTheme.light(),
  darkTheme: AppTheme.dark(),
  themeMode: ThemeMode.system, // Or user preference

  // NEVER check brightness manually for color choices:
  // BAD:
  //   color: isDark ? Colors.white : Colors.black
  // GOOD:
  //   color: colorScheme.onSurface
  // The colorScheme handles light/dark automatically
);
```

---

## Best Practices

1. **Use `ColorScheme.fromSeed`** — generates a complete, accessible color palette from one color
2. **Never hardcode colors** — always use `colorScheme` or `textTheme`
3. **Define spacing as constants** — consistent rhythm throughout the app
4. **Use `MediaQuery.sizeOf(context)`** over `MediaQuery.of(context).size` — more efficient
5. **Theme component styles globally** — `ElevatedButtonThemeData`, `CardThemeData`, etc.
6. **Test both light and dark themes** — ensure contrast and readability
7. **Use `Theme.of(context).extension<T>()`** for custom theme extensions

---

## Common Mistakes

| Mistake                               | Why It's Wrong                          | Fix                                        |
| ------------------------------------- | --------------------------------------- | ------------------------------------------ |
| Hardcoded colors (`Colors.blue`)      | Breaks dark mode, inconsistent palette  | Use `colorScheme.primary`                  |
| Hardcoded font sizes                  | Ignores accessibility, text scaling     | Use `textTheme.bodyLarge`                  |
| Magic spacing numbers                 | Inconsistent visual rhythm              | Use `AppSpacing` constants                 |
| `MediaQuery.of(context)` for size only| Rebuilds on any MediaQuery change       | Use `MediaQuery.sizeOf(context)`           |
| Separate color definitions per widget | Scattered, impossible to update         | Centralize in theme                        |
| Ignoring safe areas                   | Content hidden behind notch/nav bar     | Use `SafeArea` or `MediaQuery.paddingOf`   |

---

## Verification Checklist

- [ ] All colors come from `Theme.of(context).colorScheme` (no hardcoded Colors)
- [ ] All text styles come from `Theme.of(context).textTheme` (no hardcoded TextStyle)
- [ ] All spacing uses defined constants (no random padding values)
- [ ] Both light and dark themes are defined and tested
- [ ] `MediaQuery.sizeOf` / `paddingOf` used instead of `MediaQuery.of`
- [ ] Responsive breakpoints handle mobile, tablet, and desktop
- [ ] Safe areas are handled (`SafeArea` or manual padding)
- [ ] Component-level themes are defined at the `ThemeData` level
- [ ] No inline `TextStyle`, `BoxDecoration`, or `ButtonStyle` that should be themed
- [ ] Theme is applied at `MaterialApp` level, referenced everywhere else
