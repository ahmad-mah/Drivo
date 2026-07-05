# Flutter Bug Fixing Workflow

## Base Workflow
Follow `workflows/bug-investigation.md` as the foundation. This document adds Flutter-specific debugging techniques.

---

## Flutter Debugging Tools

### DevTools — Your Primary Debugging Suite

| Tab               | Use When                                         | What It Shows                            |
| ----------------- | ------------------------------------------------ | ---------------------------------------- |
| **Inspector**     | Widget layout issues, overflow, sizing           | Widget tree, properties, constraints     |
| **Performance**   | Jank, dropped frames, slow rendering             | Frame timing, build/paint duration       |
| **CPU Profiler**  | Slow operations, expensive functions             | Call stack flame chart                   |
| **Memory**        | Memory leaks, growing memory                     | Object allocation, retain paths          |
| **Network**       | API call failures, slow requests                 | Request/response details, timing         |
| **Logging**       | Runtime errors, debug messages                   | Console output, structured logs          |

### Common Flutter Bug Categories

| Bug Type                    | Symptoms                                    | First Step                                 |
| --------------------------- | ------------------------------------------- | ------------------------------------------ |
| **Layout overflow**         | Yellow/black striped bar                    | DevTools Inspector → check constraints     |
| **State not updating**      | UI doesn't reflect data change              | Check `notifyListeners` / `setState` call  |
| **Null error**              | Null check operator crash                   | Trace the null value back to its source    |
| **Widget not rebuilding**   | Stale data displayed                        | Check if widget is const or not listening  |
| **Memory leak**             | Growing memory over time                    | DevTools Memory → check dispose calls      |
| **Jank during scroll**      | Dropped frames                              | DevTools Performance → check build times   |
| **Navigation error**        | Route not found, wrong screen               | Check router config, route parameters      |
| **Platform crash**          | Native crash on specific device             | Check platform channel, logs               |

---

## Flutter-Specific Debugging Steps

### Layout Issues

```
1. Open DevTools Widget Inspector
2. Select the overflowing widget
3. Check "Constraints" panel — what constraints is the parent providing?
4. Common fixes:
   - Overflow in Row/Column → wrap child in Expanded or Flexible
   - Unbounded height in Column inside ListView → add shrinkWrap: true or use SliverList
   - Text overflow → add maxLines + TextOverflow.ellipsis
```

### State Issues

```
1. Verify the state management is notifying:
   - ChangeNotifier: is notifyListeners() being called?
   - Bloc: is the new state being emitted?
   - setState: is it being called?

2. Verify the widget is listening:
   - context.watch<T>() — rebuilds on change
   - context.read<T>() — does NOT rebuild (one-time read)
   - Consumer/BlocBuilder — must wrap the right subtree

3. Verify the state actually changed:
   - Immutable state: is copyWith creating a new object?
   - Mutable state: is the reference actually different?
   - Equatable: are equals/hashCode correct?
```

### Performance Issues

```
1. Run in PROFILE mode: flutter run --profile
2. Open DevTools Performance tab
3. Interact with the slow area
4. Check the timeline:
   - Build phase > 4ms → too many widgets rebuilding
   - Paint phase > 4ms → complex painting, add RepaintBoundary
   - If total > 16ms → frame dropped (jank)

5. Common fixes:
   - Excessive rebuilds → add const, scope state, extract widgets
   - Slow build → move computation to state management
   - Heavy images → resize with cacheWidth/cacheHeight
   - Expensive list → use ListView.builder with itemExtent
```

### Error-Specific Debugging

```dart
// RenderFlex overflow
// "A RenderFlex overflowed by X pixels on the bottom/right."
// Fix: Wrap child in Expanded, Flexible, or SingleChildScrollView

// setState() called after dispose()
// Fix: Check `if (mounted)` before setState after async
if (mounted) {
  setState(() => _data = newData);
}

// Looking up deactivated widget's ancestor
// Fix: Don't use context after async gaps in certain lifecycle methods
// Store the reference BEFORE the async gap
final navigator = Navigator.of(context);
await someAsyncOperation();
navigator.pop(); // Use stored reference

// Null check operator used on a null value
// Fix: Don't use ! — handle null explicitly
final user = _user;
if (user == null) return const EmptyView();
return UserProfile(user: user);
```

---

## Flutter Bug Fix Verification

After fixing a Flutter bug, additionally verify:

- [ ] Fix works on both iOS and Android (if applicable)
- [ ] Fix works in both light and dark themes
- [ ] Fix works with large/small screen sizes
- [ ] Fix works with accessibility settings (large text, screen reader)
- [ ] `flutter analyze` shows no new warnings
- [ ] No `print()` or `debugPrint()` left in production code
- [ ] Widget test covers the specific bug scenario

---

## Quick Diagnostic Reference

```
"I see yellow/black stripes"     → Layout overflow → Inspector
"The screen is blank"            → Check state handling → missing loading/error UI
"Tapping does nothing"           → Check onPressed isn't null, widget isn't covered
"Data doesn't update"            → Check notifyListeners/setState, watch vs read
"App crashes on navigation"      → Check route exists, parameters aren't null
"Scrolling is janky"             → Profile mode → Performance tab → check build time
"Memory keeps growing"           → Check dispose(), stream cancel, image cache
"Works in debug, not in release" → Check asserts, debug-only code, tree shaking
```
