# Flutter Refactoring Workflow

## Base Workflow
Follow `workflows/refactoring.md` as the foundation. This document adds Flutter-specific refactoring patterns.

---

## Common Flutter Refactorings

### 1. Extract Widget (Most Common)

**When:** A `build()` method exceeds 30 lines or contains a reusable section.

```dart
// BEFORE — large build method
@override
Widget build(BuildContext context) {
  return Column(
    children: [
      // Header section (20 lines)
      Container(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl)),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user.name, style: Theme.of(context).textTheme.titleMedium),
                Text(user.email, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ],
        ),
      ),
      // Content section (30 more lines)...
    ],
  );
}

// AFTER — extracted widget
@override
Widget build(BuildContext context) {
  return Column(
    children: [
      UserHeader(user: user),
      // Content section...
    ],
  );
}

// New file: user_header.dart
class UserHeader extends StatelessWidget {
  const UserHeader({super.key, required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(/* ... */),
    );
  }
}
```

**Steps:**
1. Identify the section to extract
2. List all data it needs (these become constructor parameters)
3. Create new `StatelessWidget` in its own file
4. Replace inline code with widget instantiation
5. Run tests → verify behavior unchanged

### 2. Extract State from Widget

**When:** Business logic is mixed into a `StatefulWidget`.

```dart
// BEFORE — logic in widget
class _OrderScreenState extends State<OrderScreen> {
  List<Order> _orders = [];
  bool _isLoading = false;

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    _orders = await api.fetchOrders();
    setState(() => _isLoading = false);
  }
}

// AFTER — state extracted to notifier
class OrdersNotifier extends ChangeNotifier {
  OrdersNotifier(this._repository);
  final OrderRepository _repository;

  OrdersState _state = const OrdersState();
  OrdersState get state => _state;

  Future<void> loadOrders() async { /* ... */ }
}

class OrderScreen extends StatelessWidget { // Now stateless!
  const OrderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<OrdersNotifier>().state;
    return /* ... */;
  }
}
```

**Steps:**
1. Identify state variables and methods
2. Create state class (immutable)
3. Create notifier/controller class
4. Move logic from widget to notifier
5. Convert widget to StatelessWidget
6. Wire via provider/dependency injection
7. Run tests

### 3. Convert Helper Methods to Widgets

**When:** Private `_build*()` methods exist in widget code.

```dart
// BEFORE
class _HomeState extends State<HomeScreen> {
  Widget _buildHeader() { /* 30 lines */ }
  Widget _buildContent() { /* 40 lines */ }
  Widget _buildFooter() { /* 20 lines */ }

  @override
  Widget build(BuildContext context) {
    return Column(children: [_buildHeader(), _buildContent(), _buildFooter()]);
  }
}

// AFTER — each is its own widget class
@override
Widget build(BuildContext context) {
  return Column(
    children: [
      HomeHeader(/* props */),
      HomeContent(/* props */),
      const HomeFooter(),
    ],
  );
}
```

### 4. Introduce Theme Constants

**When:** Hardcoded colors, sizes, or styles scattered throughout widgets.

```dart
// BEFORE — hardcoded values
Container(
  color: Color(0xFF1A73E8),
  padding: EdgeInsets.all(16),
  child: Text('Hello', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
)

// AFTER — themed
Container(
  color: theme.colorScheme.primary,
  padding: AppSpacing.allMd,
  child: Text('Hello', style: theme.textTheme.titleMedium),
)
```

**Steps:**
1. Identify all hardcoded values in the feature
2. Map each to the closest theme/spacing constant
3. Replace one file at a time
4. Run tests between each file

### 5. Replace `setState` with State Management

**When:** `setState` is managing feature-level state (not just UI toggle).

**Steps:**
1. Identify all state variables in the StatefulWidget
2. Create an immutable state class
3. Create a notifier/bloc
4. Move logic from widget methods to notifier
5. Convert StatefulWidget to StatelessWidget
6. Register the notifier in dependency injection
7. Run tests

---

## Flutter-Specific Safety Rules

1. **Run `flutter analyze` before and after** — catch any new warnings
2. **Run widget tests, not just unit tests** — refactoring can break layout
3. **Test on device after refactoring** — visual regressions may not show in tests
4. **Never change state management and widget structure in the same commit**
5. **Verify both themes** — refactoring may break dark mode

---

## Refactoring Priority for Flutter

| Priority | What to Refactor                           | When                                     |
| -------- | ------------------------------------------ | ---------------------------------------- |
| 1        | Business logic out of widgets              | When touching any widget with logic      |
| 2        | Large `build()` methods → extract widgets  | When `build()` exceeds 30 lines          |
| 3        | `_build*()` methods → widget classes       | When touching widgets with helper methods|
| 4        | Hardcoded values → theme constants         | When touching styling code               |
| 5        | `setState` → state management              | When state is shared or complex          |

---

## Verification

- [ ] `flutter analyze` passes with no new warnings
- [ ] All existing tests still pass
- [ ] Behavior is identical before and after
- [ ] Light and dark themes both render correctly
- [ ] No new `const` warnings introduced
- [ ] Refactoring is in a separate commit from behavior changes
