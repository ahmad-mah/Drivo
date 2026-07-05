# Widget Composition

## When to Load
- Building any UI component, screen, or layout
- Refactoring existing widgets
- Reviewing widget code

## Prerequisites
- `flutter/rules/widget-rules.md`
- `flutter/rules/dart-idioms.md`

---

## Core Concepts

### The Widget Tree Mental Model

Flutter UIs are trees of immutable widget descriptions. The framework diffs old and new trees to determine minimal updates. Your job is to describe the UI for a given state — never imperatively mutate it.

```
State → build() → Widget Tree → Element Tree → RenderObject Tree → Pixels
         ↑                        (Flutter manages this)
     You write this
```

### StatelessWidget vs StatefulWidget

| Use                        | Widget Type          | Why                                         |
| -------------------------- | -------------------- | ------------------------------------------- |
| Pure UI from input         | `StatelessWidget`    | No internal state, rebuilds only from props |
| Local UI state (animation, form, tab) | `StatefulWidget` | Needs mutable state tied to widget lifecycle |
| State managed externally   | `StatelessWidget`    | State comes from provider/bloc/etc          |

**Default choice:** Start with `StatelessWidget`. Upgrade to `StatefulWidget` only when local mutable state is genuinely needed.

---

## Workflow

### 1. Design Top-Down, Build Bottom-Up

```
// STEP 1: Sketch the screen structure (top-down)
// ProfileScreen
//   ├── ProfileHeader (avatar + name)
//   ├── StatsRow (followers, following, posts)
//   └── PostsList (scrollable list of posts)

// STEP 2: Build leaf widgets first (bottom-up)
class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

// STEP 3: Compose into parent widgets
class StatsRow extends StatelessWidget {
  const StatsRow({
    super.key,
    required this.followers,
    required this.following,
    required this.posts,
  });

  final int followers;
  final int following;
  final int posts;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        StatCard(label: 'Followers', value: '$followers'),
        StatCard(label: 'Following', value: '$following'),
        StatCard(label: 'Posts', value: '$posts'),
      ],
    );
  }
}
```

### 2. Extract Widgets, Not Methods

```dart
// BAD — helper method returns Widget (no independent rebuild)
class ProfileScreen extends StatelessWidget {
  Widget _buildHeader() {
    return Row(children: [/* ... */]);
  }

  Widget _buildStats() {
    return Row(children: [/* ... */]);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildHeader(),   // Rebuilds when ANYTHING in ProfileScreen changes
        _buildStats(),    // Same — no isolation
      ],
    );
  }
}

// GOOD — separate widget classes (independent rebuild scope)
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ProfileHeader(user: user),  // Only rebuilds if user changes
        StatsRow(                    // Only rebuilds if stats change
          followers: user.followersCount,
          following: user.followingCount,
          posts: user.postsCount,
        ),
      ],
    );
  }
}
```

**When method extraction is acceptable:**
- The widget is trivially small (1-3 lines)
- It's used only once and genuinely belongs to the parent
- Performance is not a concern (rare UIs, not lists)

### 3. Use `const` Constructors Everywhere Possible

```dart
// GOOD — const constructor, const instantiation
class AppLogo extends StatelessWidget {
  const AppLogo({super.key}); // const constructor

  @override
  Widget build(BuildContext context) {
    return const FlutterLogo(size: 48); // const widget
  }
}

// Usage — const instantiation prevents rebuilds
const AppLogo(), // Framework skips rebuild entirely
```

### 4. Accept Data Through Constructor, Not Context Lookups

```dart
// BAD — widget reaches into global state
class OrderTotal extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final order = Provider.of<OrderState>(context); // Tight coupling
    return Text('\$${order.total}');
  }
}

// GOOD — data passed through constructor (pure widget)
class OrderTotal extends StatelessWidget {
  const OrderTotal({super.key, required this.total});
  final double total;

  @override
  Widget build(BuildContext context) {
    return Text('\$${total.toStringAsFixed(2)}');
  }
}

// Context lookups happen in the PARENT (the "smart" widget)
class OrderScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final order = context.watch<OrderState>();
    return OrderTotal(total: order.total); // Pure child widget
  }
}
```

---

## Best Practices

### Widget Sizing

| Guideline                    | Threshold                        |
| ---------------------------- | -------------------------------- |
| Max `build()` method lines   | 30 lines                        |
| Max widget nesting depth     | 5 levels in one `build()`       |
| Max constructor parameters   | 6 (use a config object beyond)  |
| When to extract a widget     | > 10 lines or reusable          |

### Keys

Use `Key` when Flutter needs to distinguish widgets of the same type:

```dart
// REQUIRED — items in a list that reorder, add, or remove
ListView(
  children: items.map((item) =>
    ListTile(
      key: ValueKey(item.id),  // Preserves state across reorders
      title: Text(item.name),
    ),
  ).toList(),
);

// REQUIRED — switching between widgets of the same type
switch (currentTab) {
  case Tab.search:
    return const SearchPage(key: ValueKey('search'));
  case Tab.profile:
    return const ProfilePage(key: ValueKey('profile'));
}

// NOT NEEDED — static layouts that never change order
Column(
  children: [
    const Header(),   // No key needed
    const Body(),     // Always in same position
    const Footer(),   // Framework handles this
  ],
);
```

### Builder Pattern for Complex Widgets

```dart
// For widgets with many optional parameters, use named constructors
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
    this.variant = ButtonVariant.primary,
  });

  // Named constructor for common variant
  const AppButton.secondary({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.isLoading = false,
  }) : variant = ButtonVariant.secondary;

  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final ButtonVariant variant;

  @override
  Widget build(BuildContext context) { /* ... */ }
}
```

---

## Common Mistakes

| Mistake                                | Why It's Wrong                              | Fix                                        |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| Logic in `build()`                     | Runs on every rebuild, not just state changes| Move to state management or `initState`   |
| Deeply nested widget trees             | Unreadable, hard to maintain                 | Extract into named widget classes          |
| Using `StatefulWidget` for everything  | Unnecessary complexity, prevents optimizations| Default to `StatelessWidget`              |
| `setState` for app-wide state          | Causes full subtree rebuilds                 | Use proper state management solution       |
| Missing `const` on constructors        | Missed optimization, unnecessary rebuilds    | Add `const` to every eligible constructor  |
| Putting `BuildContext` in business logic| Couples domain to framework                 | Pass only the data needed, not the context |
| Using `GlobalKey` frequently           | Performance hit, breaks encapsulation        | Use `ValueKey` or `ObjectKey` instead      |

## Anti-Patterns

### 1. The Mega Widget
```dart
// ANTI-PATTERN — one widget with 500+ lines of build()
class HomeScreen extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // 400 lines of deeply nested widgets...
    );
  }
}
```
**Fix:** Extract every logical section into its own widget class.

### 2. The Prop Drilling Nightmare
```dart
// ANTI-PATTERN — passing data through 5+ widget levels
ParentWidget(user: user)
  → ChildA(user: user)      // Doesn't use user
    → ChildB(user: user)    // Doesn't use user
      → ChildC(user: user)  // Doesn't use user
        → ChildD(user: user) // Finally uses user
```
**Fix:** Use InheritedWidget, Provider, or another state management solution for deep data access.

### 3. The Side-Effect Build
```dart
// ANTI-PATTERN — build() triggers side effects
@override
Widget build(BuildContext context) {
  fetchData();  // Network call on every build!
  analytics.trackScreenView('home');  // Logged on every rebuild!
  return Container();
}
```
**Fix:** Side effects go in `initState()`, lifecycle callbacks, or state management.

---

## Verification Checklist

- [ ] All reusable UI components are separate widget classes (not helper methods)
- [ ] `const` constructor on every widget that can have one
- [ ] `const` keyword on every widget instantiation that can have one
- [ ] `build()` methods contain only UI description (no logic, no side effects)
- [ ] No widget file exceeds 200 lines
- [ ] `Key` is used on list items and dynamically swapped widgets
- [ ] No `BuildContext` passed to business logic or service classes
- [ ] Widget nesting in `build()` does not exceed 5 levels
- [ ] `StatefulWidget` is used only when local mutable state is required
- [ ] Constructor parameters are typed explicitly (no `dynamic`)
