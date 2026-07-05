# Widget Rules

## Purpose

Enforceable rules for building Flutter widgets. These rules prevent the most common widget-related bugs and performance issues.

---

## MUST Rules (Blocking)

### 1. `build()` MUST Be Pure

The `build()` method must only describe UI. No side effects, no mutations, no async calls.

```dart
// VIOLATION
@override
Widget build(BuildContext context) {
  analyticsService.trackView('home');    // Side effect!
  fetchData();                            // Async call!
  counter++;                              // Mutation!
  return const Text('Home');
}

// CORRECT
@override
Widget build(BuildContext context) {
  return const Text('Home'); // Only UI description
}
```

### 2. `const` MUST Be Used on All Eligible Constructors and Instances

```dart
// VIOLATION — missing const
class StatusBadge extends StatelessWidget {
  StatusBadge({super.key}); // Missing const

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(8), // Missing const
      child: Text('Active'),      // Missing const
    );
  }
}

// CORRECT
class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(8),
      child: Text('Active'),
    );
  }
}
```

### 3. Controllers and Subscriptions MUST Be Disposed

```dart
// VIOLATION — resource leak
class _FormState extends State<FormScreen> {
  final _controller = TextEditingController();
  late final StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = stream.listen((_) {});
    // Never disposed!
  }
}

// CORRECT
class _FormState extends State<FormScreen> {
  final _controller = TextEditingController();
  late final StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    _subscription = stream.listen((_) {});
  }

  @override
  void dispose() {
    _controller.dispose();
    _subscription.cancel();
    super.dispose();
  }
}
```

### 4. Lists MUST Use `.builder` Constructors

```dart
// VIOLATION — builds all 10,000 items immediately
ListView(
  children: allItems.map((item) => ItemTile(item: item)).toList(),
);

// CORRECT — lazy rendering
ListView.builder(
  itemCount: allItems.length,
  itemBuilder: (context, index) => ItemTile(
    key: ValueKey(allItems[index].id),
    item: allItems[index],
  ),
);
```

### 5. `StatefulWidget` MUST NOT Be Used When `StatelessWidget` Suffices

```dart
// VIOLATION — StatefulWidget with no mutable state
class UserCard extends StatefulWidget {
  const UserCard({super.key, required this.user});
  final User user;

  @override
  State<UserCard> createState() => _UserCardState();
}

class _UserCardState extends State<UserCard> {
  @override
  Widget build(BuildContext context) {
    return Card(child: Text(widget.user.name));
  }
}

// CORRECT — StatelessWidget (no internal mutable state)
class UserCard extends StatelessWidget {
  const UserCard({super.key, required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    return Card(child: Text(user.name));
  }
}
```

### 6. Keys MUST Be Used on List Items and Dynamically Swapped Widgets

```dart
// VIOLATION — no keys on reorderable list items
ReorderableListView(
  children: items.map((item) => ListTile(title: Text(item.name))).toList(),
);

// CORRECT
ReorderableListView(
  children: items.map((item) => ListTile(
    key: ValueKey(item.id), // Required for correct reordering
    title: Text(item.name),
  )).toList(),
);
```

---

## SHOULD Rules (Recommended)

### 7. Widgets SHOULD Be Extracted as Classes, Not Methods

```dart
// NOT RECOMMENDED — helper method
Widget _buildHeader() {
  return Row(children: [/* ... */]);
}

// RECOMMENDED — widget class
class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key, required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    return Row(children: [/* ... */]);
  }
}
```

### 8. Widget Files SHOULD Contain One Public Widget

```dart
// NOT RECOMMENDED — multiple public widgets in one file
// user_screen.dart
class UserScreen extends StatelessWidget { /* 100 lines */ }
class UserHeader extends StatelessWidget { /* 50 lines */ }
class UserStats extends StatelessWidget { /* 50 lines */ }

// RECOMMENDED — one public widget per file
// user_screen.dart → UserScreen
// user_header.dart → UserHeader
// user_stats.dart  → UserStats
```

**Exception:** Small, tightly-coupled helper widgets (< 20 lines) that are only used by the main widget can stay in the same file as private classes.

### 9. `BuildContext` SHOULD NOT Be Stored or Passed to Non-Widget Code

```dart
// NOT RECOMMENDED — storing context
class MyService {
  BuildContext? _context; // Dangerous! Context may be invalid

  void doSomething() {
    Navigator.of(_context!).push(/* ... */); // May crash
  }
}

// RECOMMENDED — pass only the data needed
class OrderService {
  Future<Order> createOrder(OrderInput input) async { /* ... */ }
}
```

### 10. `super.key` SHOULD Be Used Instead of Manual Key Passing

```dart
// OLD STYLE
class MyWidget extends StatelessWidget {
  const MyWidget({Key? key}) : super(key: key);
}

// MODERN — use super parameter (Dart 2.17+)
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});
}
```

---

## Architectural Guidance

### Widget Layers

```
presentation/          ← Widgets live here
  screens/             ← Full screens (routed to)
    order_screen.dart
  widgets/             ← Reusable UI components
    order_card.dart
    price_tag.dart
  dialogs/             ← Dialogs and bottom sheets
    confirm_dialog.dart
```

### Smart vs Dumb Widgets

| Type         | Knows About                  | Examples                         |
| ------------ | ---------------------------- | -------------------------------- |
| **Smart**    | State management, navigation | Screens, feature roots           |
| **Dumb**     | Only its constructor params  | Cards, badges, buttons, tiles    |

**Rule:** Maximize dumb widgets. They're reusable, testable, and easy to understand.

---

## Quality Checklist

- [ ] All `build()` methods are pure (no side effects)
- [ ] `const` on all eligible constructors and instantiations
- [ ] All controllers and subscriptions disposed in `dispose()`
- [ ] Lists use `.builder` constructors
- [ ] `StatefulWidget` used only when local mutable state exists
- [ ] Keys on list items and dynamically swapped widgets
- [ ] Widgets extracted as classes (not private methods) for reuse
- [ ] One public widget per file
- [ ] `BuildContext` not stored or passed to services
- [ ] `super.key` used (not manual Key parameter)
- [ ] Widget nesting ≤ 5 levels in any single `build()` method
- [ ] No logic in `build()` beyond simple conditionals for UI branching
