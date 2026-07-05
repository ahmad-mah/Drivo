# Navigation & Routing

## When to Load
- Adding new screens or routes
- Implementing deep linking
- Setting up navigation guards (auth checks)
- Working with tab/nested navigation

## Prerequisites
- `flutter/skills/widget-composition.md`
- `flutter/rules/project-structure.md`

---

## Core Concepts

### Declarative Routing (GoRouter — Recommended)

Modern Flutter uses declarative routing where routes are defined as data, not imperative push/pop calls.

```dart
// Route configuration — declared at app level
final router = GoRouter(
  initialLocation: '/',
  redirect: _guardRoute,
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/orders',
      builder: (context, state) => const OrdersScreen(),
      routes: [
        GoRoute(
          path: ':orderId', // /orders/123
          builder: (context, state) {
            final orderId = state.pathParameters['orderId']!;
            return OrderDetailScreen(orderId: orderId);
          },
        ),
      ],
    ),
  ],
);

// Usage in MaterialApp
MaterialApp.router(
  routerConfig: router,
);
```

### Navigation Patterns

| Pattern                    | Use Case                              | Implementation                            |
| -------------------------- | ------------------------------------- | ----------------------------------------- |
| **Push**                   | Navigate forward                      | `context.push('/orders/123')`             |
| **Go**                     | Navigate and clear stack              | `context.go('/home')`                     |
| **Pop**                    | Go back                              | `context.pop()`                           |
| **Replace**                | Replace current screen                | `context.pushReplacement('/new-screen')`  |
| **Return data**            | Pass result back to caller            | `context.pop(result)`                     |
| **Shell routes**           | Persistent UI (bottom nav, sidebar)   | `ShellRoute` with nested routes           |

---

## Workflow

### 1. Define Routes as Constants

```dart
// routes.dart — single source of truth for all route paths
abstract final class AppRoutes {
  static const home = '/';
  static const login = '/login';
  static const orders = '/orders';
  static String orderDetail(String id) => '/orders/$id';
  static const profile = '/profile';
  static const settings = '/settings';
}

// Usage — type-safe navigation
context.push(AppRoutes.orderDetail('abc-123'));
```

### 2. Shell Routes for Tab Navigation

```dart
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return AppShell(child: child); // Persistent bottom nav bar
      },
      routes: [
        GoRoute(
          path: '/',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: HomeScreen(),
          ),
        ),
        GoRoute(
          path: '/search',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: SearchScreen(),
          ),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ProfileScreen(),
          ),
        ),
      ],
    ),
    // Routes outside the shell (no bottom nav)
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
  ],
);
```

### 3. Route Guards (Authentication)

```dart
GoRouter(
  redirect: (context, state) {
    final isLoggedIn = authState.isAuthenticated;
    final isOnLoginPage = state.matchedLocation == '/login';

    // Not logged in → redirect to login
    if (!isLoggedIn && !isOnLoginPage) {
      return '/login?redirect=${state.matchedLocation}';
    }

    // Logged in but on login page → redirect to home
    if (isLoggedIn && isOnLoginPage) {
      return '/';
    }

    // No redirect needed
    return null;
  },
);
```

### 4. Passing Data Between Screens

```dart
// Option 1: Path parameters (for IDs, slugs)
GoRoute(
  path: '/users/:userId',
  builder: (context, state) {
    return UserScreen(userId: state.pathParameters['userId']!);
  },
);

// Option 2: Query parameters (for filters, optional data)
GoRoute(
  path: '/search',
  builder: (context, state) {
    final query = state.uri.queryParameters['q'] ?? '';
    return SearchScreen(initialQuery: query);
  },
);
// Navigate: context.push('/search?q=flutter')

// Option 3: Extra (for complex objects — NOT deep-linkable)
context.push('/order-confirmation', extra: orderDetails);
GoRoute(
  path: '/order-confirmation',
  builder: (context, state) {
    final order = state.extra as OrderDetails;
    return OrderConfirmationScreen(order: order);
  },
);
```

---

## Best Practices

1. **Use path parameters for required identifiers** — `/users/:id`, deep-linkable
2. **Use query parameters for optional filters** — `/search?q=term&page=2`
3. **Avoid `extra` for anything that needs deep linking** — not serializable to URL
4. **Keep route definitions in one file** — single source of truth
5. **Use `NoTransitionPage` for tab switches** — avoids slide animation between tabs
6. **Parse and validate parameters at the route level** — widgets receive typed data
7. **Handle unknown routes** — always provide an `errorBuilder`

```dart
GoRouter(
  errorBuilder: (context, state) => NotFoundScreen(
    path: state.matchedLocation,
  ),
);
```

---

## Common Mistakes

| Mistake                                | Why It's Wrong                              | Fix                                        |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------ |
| Hardcoded route strings everywhere     | Typos cause silent failures                 | Use `AppRoutes` constants                  |
| Using `extra` for deep-linkable data   | Breaks when user shares URL or refreshes    | Use path/query parameters                  |
| Navigation logic in widgets            | Couples UI to routing                       | Handle redirects in GoRouter `redirect`    |
| No error/404 route                     | Crash on invalid URL                        | Always define `errorBuilder`               |
| Not handling back button on Android    | App exits instead of navigating back        | Use `WillPopScope` / `PopScope` correctly  |
| Mixing imperative and declarative nav  | Inconsistent behavior, hard to debug        | Commit to one approach (declarative)       |

## Anti-Patterns

### 1. Navigator Spaghetti
```dart
// ANTI-PATTERN — imperative navigation everywhere
Navigator.of(context).push(MaterialPageRoute(builder: (_) => ScreenA()));
Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => ScreenB()));
Navigator.of(context).pushAndRemoveUntil(/* ... */);
// No central route definition, impossible to understand navigation flow
```

### 2. Route Logic in Widgets
```dart
// ANTI-PATTERN — auth check in every screen
class OrderScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    if (!authService.isLoggedIn) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/login'); // Navigation in build!
      });
      return const SizedBox.shrink();
    }
    return /* actual screen */;
  }
}
```
**Fix:** Use GoRouter's `redirect` for auth guards — centralized, consistent.

---

## Verification Checklist

- [ ] All route paths are defined as constants in a single file
- [ ] Deep-linkable data uses path/query parameters (not `extra`)
- [ ] Auth guards are implemented via `redirect`, not in widgets
- [ ] A 404/error route is defined
- [ ] Shell routes wrap persistent navigation UI (bottom nav, sidebar)
- [ ] Route definitions are flat and readable (not deeply nested)
- [ ] Tab navigation uses `NoTransitionPage`
- [ ] Parameters are parsed and validated at the route level
- [ ] No navigation calls inside `build()` methods
- [ ] Back button behavior is tested on Android
