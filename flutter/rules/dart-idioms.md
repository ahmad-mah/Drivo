# Dart Idioms — Modern Dart 3+ Patterns

## Purpose

Rules for writing idiomatic, modern Dart. These are Dart-specific conventions that go beyond generic programming practices. Always use the latest stable language features.

---

## Language Rules

### 1. Use Pattern Matching and Exhaustive Switches (Dart 3+)

```dart
// BAD — old-style type checking
Widget buildContent(UiState state) {
  if (state is Loading) {
    return const CircularProgressIndicator();
  } else if (state is Loaded) {
    return ContentView(data: state.data);
  } else if (state is Error) {
    return ErrorView(message: state.message);
  }
  return const SizedBox.shrink(); // Dead code — what state is this?
}

// GOOD — exhaustive switch expression (compiler ensures all cases)
Widget buildContent(UiState state) => switch (state) {
  Loading() => const CircularProgressIndicator(),
  Loaded(:final data) => ContentView(data: data),
  Error(:final message) => ErrorView(message: message),
};
```

### 2. Use Sealed Classes for State Hierarchies

```dart
// GOOD — sealed class gives exhaustive pattern matching
sealed class AuthState {}
class Unauthenticated extends AuthState {}
class Authenticating extends AuthState {}
class Authenticated extends AuthState {
  Authenticated(this.user);
  final User user;
}
class AuthError extends AuthState {
  AuthError(this.message);
  final String message;
}

// The compiler FORCES you to handle all cases
String describeAuth(AuthState state) => switch (state) {
  Unauthenticated() => 'Please log in',
  Authenticating() => 'Verifying...',
  Authenticated(:final user) => 'Welcome, ${user.name}',
  AuthError(:final message) => 'Error: $message',
};
```

### 3. Use Records for Lightweight Data Grouping

```dart
// GOOD — records for returning multiple values
(String, int) parseVersion(String version) {
  final parts = version.split('.');
  return (parts[0], int.parse(parts[1]));
}

final (major, minor) = parseVersion('3.22');

// GOOD — named fields for clarity
({double lat, double lng}) getLocation() {
  return (lat: 37.7749, lng: -122.4194);
}

final (:lat, :lng) = getLocation();
```

### 4. Use Enhanced Enums

```dart
// GOOD — enums with data and behavior
enum Priority {
  low(value: 0, label: 'Low', color: Colors.green),
  medium(value: 1, label: 'Medium', color: Colors.orange),
  high(value: 2, label: 'High', color: Colors.red),
  critical(value: 3, label: 'Critical', color: Colors.purple);

  const Priority({
    required this.value,
    required this.label,
    required this.color,
  });

  final int value;
  final String label;
  final Color color;

  bool get isUrgent => value >= 2;
}
```

### 5. Use Class Modifiers Intentionally

```dart
// final — cannot be extended or implemented outside this library
final class UserRepository { /* ... */ }

// sealed — only extended within this file (enables exhaustive switching)
sealed class Result<T> {}
class Success<T> extends Result<T> { final T value; /* ... */ }
class Failure<T> extends Result<T> { final Exception error; /* ... */ }

// base — can be extended but not implemented outside this library
base class BaseService { /* ... */ }

// interface — can be implemented but not extended outside this library
interface class Cacheable { void clearCache(); }

// mixin — composable behavior
mixin Loggable {
  void log(String message) => debugPrint('[$runtimeType] $message');
}
```

### 6. Null Safety — Strict Adherence

```dart
// ALWAYS prefer non-nullable types
class User {
  const User({required this.name, required this.email});
  final String name;     // Non-nullable by default
  final String email;
}

// Use nullable ONLY when absence is meaningful
class UserProfile {
  const UserProfile({required this.name, this.bio});
  final String name;
  final String? bio;     // User may not have set a bio
}

// Use the right null-aware operators
final displayName = user?.name ?? 'Anonymous';    // Null coalescing
final length = items?.length;                      // Null-aware access
final uppercased = name?.toUpperCase();             // Null-aware method call
items?.add(newItem);                                // Null-aware cascade

// NEVER use the bang operator (!) without validation
// BAD
final name = nullableValue!; // Crash if null

// GOOD
final name = nullableValue;
if (name == null) return; // Handle null explicitly
// name is promoted to non-null here
```

### 7. Collection Literals and Spread Operators

```dart
// Use collection literals
final list = <String>[];        // Not: List<String>()
final map = <String, int>{};    // Not: Map<String, int>()
final set = <int>{};            // Not: Set<int>()

// Use spreads for composing collections
final combined = [
  ...existingItems,
  newItem,
  if (showExtra) extraItem,    // Collection if
  for (final x in moreItems)   // Collection for
    transform(x),
];
```

### 8. Extension Methods and Types

```dart
// Extension methods — add functionality to existing types
extension StringValidation on String {
  bool get isValidEmail => RegExp(r'^[\w-.]+@[\w-]+\.\w+$').hasMatch(this);
  bool get isNotBlank => trim().isNotEmpty;
}

// Usage
if (email.isValidEmail) { /* ... */ }

// Extension types (Dart 3.3+) — zero-cost wrappers
extension type UserId(String value) {
  // Type-safe ID that prevents mixing up different ID types
  // No runtime overhead — compiles to just String
}

extension type OrderId(String value) {}

// Now the compiler prevents:
// void process(UserId uid, OrderId oid) { ... }
// process(orderId, userId); // Compile error!
```

### 9. Type Inference — When to Specify

```dart
// LET the compiler infer for local variables
final name = 'Alice';                     // String inferred
final items = <Widget>[];                 // Specify generic type
final filtered = list.where((e) => e.isActive); // Iterable<T> inferred

// ALWAYS specify for public APIs
class UserService {
  // Return type explicit
  Future<User> getUser(String id) async { /* ... */ }

  // Parameter types explicit
  void updateUser(User user, {bool notify = false}) { /* ... */ }

  // Property type explicit
  final UserRepository _repository;
}

// NEVER use `dynamic` — use `Object?` if truly any type
// BAD
dynamic parseResponse(dynamic input) { /* ... */ }

// GOOD
Object? parseResponse(Object? input) { /* ... */ }
```

### 10. Effective `toString`, `==`, and `hashCode`

```dart
// For value types, implement equality properly
class Money {
  const Money(this.amount, this.currency);
  final double amount;
  final String currency;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Money &&
          other.amount == amount &&
          other.currency == currency;

  @override
  int get hashCode => Object.hash(amount, currency);

  @override
  String toString() => '$currency ${amount.toStringAsFixed(2)}';
}

// Or use Equatable / freezed for boilerplate reduction
```

---

## Naming Conventions (Dart-Specific)

| Element                 | Convention            | Example                          |
| ----------------------- | --------------------- | -------------------------------- |
| Files                   | `snake_case`          | `user_repository.dart`           |
| Classes                 | `UpperCamelCase`      | `UserRepository`                 |
| Variables, functions    | `lowerCamelCase`      | `userName`, `fetchOrders()`      |
| Constants               | `lowerCamelCase`      | `defaultTimeout` (NOT UPPER_SNAKE) |
| Private members         | `_` prefix            | `_cache`, `_processData()`       |
| Type parameters         | Single letter or short| `T`, `E`, `K`, `V`              |
| Library prefixes        | `lowercase`           | `import '...' as math`           |
| Enums                   | `UpperCamelCase`      | `ConnectionState.active`         |

**Note:** Dart constants use `lowerCamelCase`, not `UPPER_SNAKE_CASE`:
```dart
// BAD (not Dart convention)
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// GOOD (Dart convention)
const maxRetryCount = 3;
const apiBaseUrl = 'https://api.example.com';
```

---

## Performance Recommendations

1. **Use `const` constructors** — compile-time constants are never rebuilt
2. **Prefer `final` over `var`** — immutability enables optimizations
3. **Use `Iterable` lazily** — `.where()` and `.map()` are lazy; don't `.toList()` until needed
4. **Avoid string concatenation in loops** — use `StringBuffer`
5. **Use `identical()` for reference equality** — faster than `==`

---

## Maintainability Guidelines

1. **Prefer `show` in imports** when importing specific items
2. **Order imports:** dart: → package: → relative (auto-handled by formatter)
3. **Use `part` files sparingly** — prefer separate files
4. **Avoid `late` unless genuinely needed** — use nullable or factory constructors
5. **Document all public APIs** with `///` doc comments

```dart
/// Fetches a user by their unique identifier.
///
/// Throws [UserNotFoundException] if no user exists with the given [id].
/// Returns the [User] with all profile data populated.
Future<User> fetchUser(String id) async { /* ... */ }
```

---

## Quality Checklist

- [ ] Pattern matching used for type-based branching (not if-else chains)
- [ ] Sealed classes used for state hierarchies with exhaustive switching
- [ ] Enhanced enums used for finite sets with associated data
- [ ] Null safety strict — no unnecessary `!` operators
- [ ] `const` used on all eligible expressions
- [ ] `final` preferred over `var` for all non-reassigned variables
- [ ] No `dynamic` types (use `Object?` if needed)
- [ ] Constants use `lowerCamelCase` (Dart convention, not UPPER_SNAKE)
- [ ] All public APIs have `///` documentation
- [ ] Extension methods used to add domain behavior to existing types
