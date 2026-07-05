# State Management

## When to Load
- Adding reactive state to any feature
- Choosing a state management approach
- Refactoring state logic
- Debugging state-related issues

## Prerequisites
- `flutter/skills/widget-composition.md`
- `flutter/rules/widget-rules.md`

---

## Core Concepts

### State Categories

| Category         | Scope            | Lifetime                | Examples                                | Solution                       |
| ---------------- | ---------------- | ----------------------- | --------------------------------------- | ------------------------------ |
| **Ephemeral**    | Single widget    | Widget lifecycle        | Tab index, animation, form focus        | `setState`, `ValueNotifier`    |
| **Feature**      | Feature/screen   | Screen lifecycle        | Form data, list filters, search query   | State management (Bloc/Riverpod/ChangeNotifier) |
| **App-wide**     | Entire app       | App lifecycle           | Auth state, theme, locale, user profile | State management at app root   |
| **Server**       | Backend          | Cached locally          | API responses, database queries         | State management + caching     |

**Rule:** Use the simplest solution that matches the scope. Don't use app-wide state management for a tab index.

---

## Workflow

### 1. Identify the State Category

```
Is this state used by only ONE widget?
├─ YES → Use setState or ValueNotifier (ephemeral)
└─ NO  → Is it used within ONE feature/screen?
    ├─ YES → Feature-level state management
    └─ NO  → App-wide state management
```

### 2. Separate State from UI

**Always separate business logic from widget code.**

```dart
// BAD — business logic mixed with UI
class OrderScreen extends StatefulWidget {
  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  List<Order> _orders = [];
  bool _isLoading = false;
  String? _error;

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse('/api/orders'));
      final data = jsonDecode(response.body);
      setState(() {
        _orders = data.map((e) => Order.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // UI depends on scattered state...
  }
}

// GOOD — state and logic separated
// State object (immutable)
class OrdersState {
  const OrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
  });

  final List<Order> orders;
  final bool isLoading;
  final String? error;

  bool get hasError => error != null;
  bool get isEmpty => orders.isEmpty && !isLoading;
}

// State holder (manages transitions)
class OrdersNotifier extends ChangeNotifier {
  OrdersNotifier(this._repository);
  final OrderRepository _repository;

  OrdersState _state = const OrdersState();
  OrdersState get state => _state;

  Future<void> loadOrders() async {
    _state = const OrdersState(isLoading: true);
    notifyListeners();
    try {
      final orders = await _repository.fetchOrders();
      _state = OrdersState(orders: orders);
    } catch (e) {
      _state = OrdersState(error: e.toString());
    }
    notifyListeners();
  }
}

// Widget — pure UI
class OrderScreen extends StatelessWidget {
  const OrderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<OrdersNotifier>().state;
    return switch (state) {
      OrdersState(isLoading: true) => const LoadingIndicator(),
      OrdersState(hasError: true, error: final e) => ErrorView(message: e!),
      OrdersState(isEmpty: true) => const EmptyOrdersView(),
      _ => OrdersList(orders: state.orders),
    };
  }
}
```

### 3. Model State as Sealed Classes (Recommended for Complex State)

```dart
// Using Dart 3 sealed classes for exhaustive state handling
sealed class OrdersState {
  const OrdersState();
}

class OrdersInitial extends OrdersState {
  const OrdersInitial();
}

class OrdersLoading extends OrdersState {
  const OrdersLoading();
}

class OrdersLoaded extends OrdersState {
  const OrdersLoaded(this.orders);
  final List<Order> orders;
}

class OrdersError extends OrdersState {
  const OrdersError(this.message);
  final String message;
}

// Exhaustive switch — compiler ensures all states are handled
Widget build(BuildContext context) {
  return switch (state) {
    OrdersInitial() => const SizedBox.shrink(),
    OrdersLoading() => const CircularProgressIndicator(),
    OrdersLoaded(:final orders) => OrdersList(orders: orders),
    OrdersError(:final message) => ErrorView(message: message),
  };
}
```

### 4. Handle All UI States

Every screen/feature must handle these states:

| State       | What the user sees                     | Implementation                         |
| ----------- | -------------------------------------- | -------------------------------------- |
| **Initial** | Before any action is taken             | Prompt or auto-load                    |
| **Loading** | Data is being fetched                  | Skeleton, shimmer, or spinner          |
| **Loaded**  | Data is available                      | Render the content                     |
| **Empty**   | Data loaded but nothing to show        | Empty state illustration + CTA         |
| **Error**   | Something went wrong                   | Error message + retry action           |

---

## Best Practices

### setState — When and How

```dart
// APPROPRIATE — truly ephemeral, local UI state
class _ExpandableTileState extends State<ExpandableTile> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _isExpanded = !_isExpanded),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: _isExpanded ? 200 : 60,
        child: widget.child,
      ),
    );
  }
}

// INAPPROPRIATE — business logic in setState
// Move to a state management solution instead
```

### Immutable State Objects

```dart
// GOOD — immutable state with copyWith
class ProfileState {
  const ProfileState({
    this.name = '',
    this.email = '',
    this.isEditing = false,
  });

  final String name;
  final String email;
  final bool isEditing;

  ProfileState copyWith({
    String? name,
    String? email,
    bool? isEditing,
  }) {
    return ProfileState(
      name: name ?? this.name,
      email: email ?? this.email,
      isEditing: isEditing ?? this.isEditing,
    );
  }
}
```

### Scoping State to Features

```dart
// Each feature provides its own state at its root
class OrdersFeature extends StatelessWidget {
  const OrdersFeature({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => OrdersNotifier(context.read<OrderRepository>()),
      child: const OrdersScreen(),
    );
  }
}
```

---

## Common Mistakes

| Mistake                                | Why It's Wrong                               | Fix                                        |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| `setState` for shared state            | Doesn't propagate to other widgets           | Use a state management solution            |
| Mutable state objects                  | Hard to track changes, breaks `==` comparison| Use immutable classes with `copyWith`      |
| Not handling loading/error states      | Blank screens, confusing UX                  | Handle all 5 UI states explicitly          |
| Business logic in widgets              | Untestable, tightly coupled                  | Separate into notifier/bloc/controller     |
| Rebuilding entire tree on state change | Performance waste                            | Scope providers to features, use `select`  |
| Calling `notifyListeners` in constructor| Triggers before widget is mounted           | Call in `init()` method or lazily          |
| Not disposing controllers              | Memory leaks, stale listeners                | Dispose in `dispose()` or use auto-dispose |

## Anti-Patterns

### 1. God State Object
```dart
// ANTI-PATTERN — one state class for the entire app
class AppState extends ChangeNotifier {
  User? user;
  List<Order> orders;
  ThemeMode theme;
  String locale;
  List<Product> products;
  Cart cart;
  // 50 more fields...
}
```
**Fix:** Separate state by feature. Each feature owns its own state.

### 2. Deeply Nested Provider Pyramids
```dart
// ANTI-PATTERN
MultiProvider(
  providers: [
    // 20+ providers at the app root
    ChangeNotifierProvider(create: (_) => AuthState()),
    ChangeNotifierProvider(create: (_) => ThemeState()),
    ChangeNotifierProvider(create: (_) => OrderState()),
    ChangeNotifierProvider(create: (_) => ProductState()),
    // ...
  ],
)
```
**Fix:** Only app-wide state at root. Feature state at feature level.

### 3. setState Cascade
```dart
// ANTI-PATTERN — multiple setStates in sequence
void _onSubmit() {
  setState(() => _isLoading = true);
  // ...
  setState(() => _isLoading = false);
  setState(() => _isSuccess = true);
  setState(() => _message = 'Done!');
  // 4 rebuilds for one action
}

// FIX — single setState or better, use a state object
void _onSubmit() {
  setState(() {
    _isLoading = false;
    _isSuccess = true;
    _message = 'Done!';
  });
}
```

---

## Verification Checklist

- [ ] State is categorized correctly (ephemeral vs feature vs app-wide)
- [ ] Business logic is separated from UI widgets
- [ ] State objects are immutable with `copyWith` methods
- [ ] All 5 UI states are handled (initial, loading, loaded, empty, error)
- [ ] State management is scoped to the appropriate level (not everything at root)
- [ ] `setState` is used only for ephemeral, single-widget state
- [ ] No `BuildContext` passed to state management classes
- [ ] All controllers/notifiers are properly disposed
- [ ] State changes trigger minimal rebuilds (not entire tree)
- [ ] Sealed classes or equivalent pattern used for complex state transitions
