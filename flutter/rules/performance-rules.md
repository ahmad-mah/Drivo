# Flutter Performance Rules

## Purpose

Enforceable performance rules for Flutter applications. These prevent the most common performance problems that cause jank, excessive memory usage, and slow startup.

---

## Build Performance — MUST

### 1. Never Create Objects Inside `build()`

```dart
// VIOLATION — new InputDecoration on every rebuild
@override
Widget build(BuildContext context) {
  return TextField(
    decoration: InputDecoration(  // New object every build
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8), // New object every build
      ),
    ),
  );
}

// CORRECT — const or static
@override
Widget build(BuildContext context) {
  return const TextField(
    decoration: InputDecoration(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(8)),
      ),
    ),
  );
}

// For dynamic values, cache what you can
class _MyWidgetState extends State<MyWidget> {
  static final _borderRadius = BorderRadius.circular(8);
  // ...
}
```

### 2. Use `const` Aggressively

```dart
// Framework SKIPS rebuild for const widgets entirely
// This is the single biggest performance win in Flutter

// Not just on constructors — on USAGE:
Column(
  children: const [       // const list
    Icon(Icons.home),     // const child
    SizedBox(height: 8),  // const spacer
    Text('Home'),         // const text
  ],
)
```

### 3. Avoid Unnecessary `setState` Scope

```dart
// BAD — rebuilds everything for a small change
setState(() {
  _selectedIndex = index;
  // Everything in build() re-executes
});

// BETTER — scope the state change to only what needs it
// Extract the changing part into its own widget
class TabIndicator extends StatefulWidget { /* only this rebuilds */ }
```

---

## List & Scroll Performance — MUST

### 4. Use `ListView.builder` for Dynamic Lists

```dart
// VIOLATION
ListView(children: items.map((i) => Widget(i)).toList()); // All built upfront

// CORRECT
ListView.builder(
  itemCount: items.length,
  itemBuilder: (_, i) => Widget(items[i]), // Only visible items built
);
```

### 5. Set `itemExtent` for Fixed-Height Lists

```dart
// 2-3x faster scrolling for fixed-height items
ListView.builder(
  itemCount: items.length,
  itemExtent: 72.0,  // Framework skips layout calculation
  itemBuilder: (_, i) => ListTile(title: Text(items[i].name)),
);

// Or use prototypeItem
ListView.builder(
  itemCount: items.length,
  prototypeItem: const ListTile(title: Text('')), // Framework measures once
  itemBuilder: (_, i) => ListTile(title: Text(items[i].name)),
);
```

### 6. Add `addAutomaticKeepAlives: false` for Disposable List Items

```dart
// When list items don't need to maintain state when scrolled off-screen
ListView.builder(
  addAutomaticKeepAlives: false,  // Items disposed when off-screen
  addRepaintBoundaries: true,      // Each item paints independently
  itemCount: items.length,
  itemBuilder: (_, i) => SimpleItemTile(item: items[i]),
);
```

---

## Image Performance — MUST

### 7. Resize Images to Display Size

```dart
// VIOLATION — decoding full 4K image for a 48px avatar
CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl));

// CORRECT — decode at display size
CircleAvatar(
  backgroundImage: ResizeImage(
    NetworkImage(user.avatarUrl),
    width: 96,  // 2x display size for retina
    height: 96,
  ),
);

// Or use Image widget with cacheWidth/cacheHeight
Image.network(
  user.avatarUrl,
  cacheWidth: 96,
  cacheHeight: 96,
);
```

---

## Animation Performance — SHOULD

### 8. Use `AnimatedFoo` Widgets for Simple Animations

```dart
// For most animations, implicit animations are sufficient and optimized
AnimatedContainer(
  duration: const Duration(milliseconds: 300),
  width: isExpanded ? 200 : 100,
  color: isActive ? Colors.blue : Colors.grey,
);

AnimatedOpacity(
  duration: const Duration(milliseconds: 200),
  opacity: isVisible ? 1.0 : 0.0,
  child: const MyWidget(),
);

// Use explicit animations (AnimationController) only when:
// - You need to control timing precisely
// - You need to chain or stagger animations
// - The animation is complex or custom
```

### 9. Use `RepaintBoundary` for Isolated Animations

```dart
// Frequently animating widget should not cause parent to repaint
Stack(
  children: [
    const StaticBackground(),      // Doesn't need to repaint
    RepaintBoundary(
      child: AnimatedParticles(),  // Repaints 60fps — isolated
    ),
    const StaticOverlay(),         // Doesn't need to repaint
  ],
);
```

---

## Startup Performance — SHOULD

### 10. Defer Non-Critical Initialization

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Only critical initialization before runApp
  await initializeCriticalServices(); // Auth, config

  runApp(const App());

  // Defer non-critical initialization
  WidgetsBinding.instance.addPostFrameCallback((_) {
    initializeAnalytics();
    initializeCrashReporting();
    preloadSecondaryData();
  });
}
```

---

## Performance Budgets

| Metric                          | Budget           | How to Measure                    |
| ------------------------------- | ---------------- | --------------------------------- |
| Frame render time               | < 16ms           | DevTools Performance tab          |
| App startup (cold)              | < 3 seconds      | `flutter run --trace-startup`     |
| Image memory per screen         | < 50MB           | DevTools Memory tab               |
| Widget rebuild count per frame  | < 20             | Widget Inspector rebuild counts   |
| List scroll smoothness          | 60fps constant   | DevTools Performance tab          |

---

## Quality Checklist

- [ ] `const` used on all eligible constructors and instantiations
- [ ] No object creation inside `build()` that could be const/static/cached
- [ ] All dynamic lists use `.builder` constructors
- [ ] `itemExtent` or `prototypeItem` set for fixed-height list items
- [ ] Images resized to display dimensions (not full resolution)
- [ ] `RepaintBoundary` wraps frequently-animating widgets
- [ ] Heavy computation offloaded to isolates
- [ ] No unnecessary rebuilds (state scoped, `select` used)
- [ ] App startup defers non-critical initialization
- [ ] Performance validated in profile mode (not debug)
