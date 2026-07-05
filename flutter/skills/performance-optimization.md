# Performance Optimization

## When to Load
- Investigating janky scrolling or animations
- Optimizing list rendering
- Reducing app startup time
- Profiling with Flutter DevTools

## Prerequisites
- `flutter/skills/widget-composition.md`
- `flutter/rules/widget-rules.md`

---

## Core Concepts

### Flutter's Rendering Pipeline

```
Widget Tree → Element Tree → RenderObject Tree → Layer Tree → Rasterization
   (your code)    (framework)     (framework)      (framework)    (engine)

Performance problems occur when:
1. Too many widgets rebuild unnecessarily (Widget → Element)
2. Too many pixels repaint unnecessarily (RenderObject → Layer)
3. Heavy computation blocks the UI thread (Dart code)
```

### The 60fps Budget

Each frame has ~16ms to complete. If your `build()` or paint takes longer, you drop frames → jank.

---

## Workflow

### 1. Minimize Widget Rebuilds

```dart
// PROBLEM: Parent rebuild causes ALL children to rebuild
class ParentWidget extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Counter: $_count'),        // Needs rebuild
        const ExpensiveWidget(),         // Doesn't need rebuild but might get one
        const AnotherExpensiveWidget(),  // Same
      ],
    );
  }
}

// SOLUTION 1: const widgets (skipped entirely during rebuild)
const ExpensiveWidget(),  // Framework knows this hasn't changed

// SOLUTION 2: Extract state-dependent part into its own widget
class CounterDisplay extends StatelessWidget {
  const CounterDisplay({super.key, required this.count});
  final int count;

  @override
  Widget build(BuildContext context) {
    return Text('Counter: $count');
  }
}
// Now only CounterDisplay rebuilds, not ExpensiveWidget

// SOLUTION 3: Use selective watching with state management
// Only rebuild widgets that depend on the specific state that changed
final count = context.select<AppState, int>((s) => s.count);
```

### 2. Optimize Lists

```dart
// BAD — builds ALL items upfront (terrible for long lists)
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
);

// GOOD — builds only visible items (lazy rendering)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id),
    item: items[index],
  ),
);

// BETTER — for items with fixed height (faster scrolling calculations)
ListView.builder(
  itemCount: items.length,
  itemExtent: 72, // Known height → framework skips measurement
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
);

// For grids and complex layouts
SliverList.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
);
```

### 3. Optimize Images

```dart
// Resize images to display size (don't decode full resolution)
Image.network(
  imageUrl,
  cacheWidth: 200,   // Decode at this width (saves memory)
  cacheHeight: 200,  // Decode at this height
  fit: BoxFit.cover,
);

// Use cached_network_image for network images
CachedNetworkImage(
  imageUrl: imageUrl,
  memCacheWidth: 200,
  placeholder: (_, __) => const ShimmerPlaceholder(),
  errorWidget: (_, __, ___) => const Icon(Icons.error),
);

// Precache images that are needed soon
precacheImage(NetworkImage(url), context);
```

### 4. Avoid Expensive Operations in build()

```dart
// BAD — formatting, filtering, sorting in build()
@override
Widget build(BuildContext context) {
  final filtered = items.where((i) => i.isActive).toList(); // On every build!
  filtered.sort((a, b) => a.name.compareTo(b.name));        // On every build!
  final formatted = filtered.map((i) => '${i.name}: \$${i.price.toStringAsFixed(2)}');

  return ListView(
    children: formatted.map((f) => Text(f)).toList(),
  );
}

// GOOD — compute in state management, cache results
class ItemsNotifier extends ChangeNotifier {
  List<Item> _items = [];
  List<Item> _filteredItems = []; // Cached

  void setItems(List<Item> items) {
    _items = items;
    _filteredItems = items
        .where((i) => i.isActive)
        .toList()
      ..sort((a, b) => a.name.compareTo(b.name));
    notifyListeners();
  }

  List<Item> get activeItems => _filteredItems;
}
```

### 5. RepaintBoundary for Isolated Repaints

```dart
// When one part of the screen repaints frequently (animation, video)
// but surrounding content is static:
Column(
  children: [
    const StaticHeader(),       // Doesn't repaint
    RepaintBoundary(
      child: AnimatedWidget(),  // Repaints frequently — isolated
    ),
    const StaticFooter(),       // Doesn't repaint
  ],
);
```

### 6. Heavy Computation Off the UI Thread

```dart
// BAD — JSON parsing on UI thread (blocks rendering)
final response = await http.get(uri);
final items = jsonDecode(response.body) // Blocks if body is large
    .map((e) => Item.fromJson(e))
    .toList();

// GOOD — parse on isolate
final response = await http.get(uri);
final items = await Isolate.run(() {
  return (jsonDecode(response.body) as List)
      .map((e) => Item.fromJson(e as Map<String, dynamic>))
      .toList();
});
```

---

## Profiling with DevTools

### When to Profile

1. **Janky scrolling** — frames take > 16ms
2. **Slow screen transitions** — noticeable lag when navigating
3. **High memory usage** — growing memory over time
4. **Slow startup** — splash screen visible too long

### Profiling Steps

```
1. Run in PROFILE mode (not debug — debug has overhead)
   $ flutter run --profile

2. Open DevTools
   → Performance tab: check frame rendering times
   → Widget Inspector: find unnecessary rebuilds
   → Memory tab: check for leaks

3. Identify the bottleneck:
   - Build phase too long? → Too many widgets rebuilding
   - Paint phase too long? → Complex painting, missing RepaintBoundary
   - Memory growing? → Missing dispose, image cache too large
```

---

## Best Practices

1. **Always use `const` constructors** — framework skips rebuild entirely
2. **Always use `ListView.builder`** for any list with > 20 items
3. **Specify `itemExtent`** when items have fixed height — faster scrolling
4. **Resize images to display size** — `cacheWidth`/`cacheHeight`
5. **Keep `build()` pure and fast** — no filtering, sorting, or formatting
6. **Profile in profile mode, not debug** — debug is 10x slower
7. **Dispose all animation controllers** — prevent memory leaks

---

## Common Mistakes

| Mistake                              | Impact                              | Fix                                        |
| ------------------------------------ | ----------------------------------- | ------------------------------------------ |
| Not using `const`                    | Unnecessary rebuilds                | Add `const` everywhere possible            |
| `ListView` with all children         | Builds all items, slow scroll       | Use `ListView.builder`                     |
| Full-resolution images               | Excessive memory, slow decoding     | Use `cacheWidth`/`cacheHeight`             |
| Heavy work in `build()`             | Dropped frames, jank                | Move to state management or isolate        |
| Profiling in debug mode              | Misleading results (too slow)       | Profile in `--profile` mode                |
| Not disposing AnimationControllers   | Memory leak, continued ticking      | Always dispose in `dispose()`              |
| Rebuilding entire tree on state change| Wasted work                        | Scope state, use `const`, use `select`     |

---

## Verification Checklist

- [ ] `const` is used on all eligible constructors and instantiations
- [ ] Long lists use `ListView.builder` or `SliverList.builder`
- [ ] `itemExtent` is set for fixed-height list items
- [ ] Images are resized to display dimensions (`cacheWidth`/`cacheHeight`)
- [ ] No filtering, sorting, or formatting in `build()` methods
- [ ] Heavy computation runs on isolates
- [ ] `RepaintBoundary` wraps frequently-repainting widgets
- [ ] All AnimationControllers are disposed
- [ ] Performance is validated in profile mode (not debug)
- [ ] State management uses selective watching to minimize rebuilds
