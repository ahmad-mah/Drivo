# Flutter Project Structure

## Purpose

Defines how a Flutter project should be organized for maximum navigability, feature isolation, and scalability. This extends the generic `skills/code-organization.md` with Flutter-specific conventions.

---

## Standard Flutter Project Structure

```
lib/
├── main.dart                        # App entry point — only bootstrap
├── app.dart                         # MaterialApp configuration
├── core/                            # Shared infrastructure
│   ├── config/                      # App configuration, environment
│   │   ├── app_config.dart
│   │   └── environment.dart
│   ├── constants/                   # App-wide constants
│   │   ├── app_spacing.dart
│   │   └── api_endpoints.dart
│   ├── errors/                      # Base error/exception types
│   │   ├── app_exception.dart
│   │   └── failure.dart
│   ├── network/                     # HTTP client, interceptors
│   │   ├── api_client.dart
│   │   └── api_interceptor.dart
│   ├── routing/                     # GoRouter configuration
│   │   ├── app_router.dart
│   │   └── routes.dart
│   ├── theme/                       # Theme definitions
│   │   ├── app_theme.dart
│   │   └── app_colors.dart
│   └── utils/                       # Truly generic utilities (< 10 files)
│       ├── date_formatter.dart
│       └── validators.dart
├── features/                        # Feature modules (bulk of the app)
│   ├── auth/
│   │   ├── data/                    # Data layer
│   │   │   ├── models/             # DTOs, serialization models
│   │   │   │   └── auth_response_model.dart
│   │   │   ├── repositories/       # Repository implementations
│   │   │   │   └── auth_repository_impl.dart
│   │   │   └── sources/            # Data sources (API, local)
│   │   │       ├── auth_remote_source.dart
│   │   │       └── auth_local_source.dart
│   │   ├── domain/                  # Domain layer
│   │   │   ├── entities/           # Domain entities
│   │   │   │   └── user.dart
│   │   │   ├── repositories/       # Repository interfaces
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/           # Use cases
│   │   │       ├── login_usecase.dart
│   │   │       └── logout_usecase.dart
│   │   └── presentation/           # UI layer
│   │       ├── screens/            # Full screens
│   │       │   └── login_screen.dart
│   │       ├── widgets/            # Feature-specific widgets
│   │       │   └── login_form.dart
│   │       └── providers/          # State management for this feature
│   │           └── auth_provider.dart
│   ├── orders/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── profile/
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/                          # Code shared between 2+ features
│   ├── widgets/                     # Shared UI components
│   │   ├── app_button.dart
│   │   ├── loading_indicator.dart
│   │   └── error_view.dart
│   └── models/                      # Shared data models
│       └── pagination.dart
├── l10n/                            # Localization
│   ├── app_en.arb
│   └── app_ar.arb
test/                                # Mirrors lib/ structure
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── orders/
├── shared/
└── core/
```

---

## Rules

### 1. Feature-First Organization — MUST

Code is organized by feature, not by type. Everything related to "auth" lives in `features/auth/`.

```
# BAD — organized by type
lib/
  models/
    user.dart
    order.dart
  repositories/
    user_repository.dart
    order_repository.dart
  screens/
    login_screen.dart
    order_screen.dart

# GOOD — organized by feature
lib/
  features/
    auth/
      domain/entities/user.dart
      data/repositories/auth_repository_impl.dart
      presentation/screens/login_screen.dart
    orders/
      domain/entities/order.dart
      data/repositories/order_repository_impl.dart
      presentation/screens/order_screen.dart
```

### 2. Layer Separation Within Features — SHOULD

Each feature follows a layered structure:

| Layer            | Contains                                    | Depends On        |
| ---------------- | ------------------------------------------- | ----------------- |
| `domain/`        | Entities, repository interfaces, use cases  | Nothing           |
| `data/`          | Repository impls, models, data sources      | `domain/`         |
| `presentation/`  | Screens, widgets, state management          | `domain/`         |

**When to simplify:** Small features (< 5 files) can flatten layers:
```
features/
  settings/
    settings_screen.dart
    settings_provider.dart
    settings_repository.dart
```

### 3. Import Rules — MUST

```dart
// MUST: Use package imports for files outside the current directory
import 'package:my_app/core/theme/app_theme.dart';

// MAY: Use relative imports for files in the same feature
import '../domain/entities/user.dart';

// MUST NOT: Import between features directly
// features/orders/ must NOT import from features/auth/
// Use shared/ or dependency injection for cross-feature communication
```

### 4. File Naming — MUST

```
all_files_use_snake_case.dart
one_class_per_file.dart  (with exceptions for small private helpers)

Naming patterns:
  <name>_screen.dart      → Full routable screens
  <name>_widget.dart      → Reusable widget (or just <name>.dart)
  <name>_provider.dart    → State management
  <name>_repository.dart  → Data access interface
  <name>_model.dart       → DTO / serialization model
  <name>_usecase.dart     → Business logic unit
  <name>_service.dart     → Infrastructure service
  <name>_test.dart        → Test file
```

### 5. `main.dart` MUST Be Minimal

```dart
// main.dart — only bootstrap, nothing else
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDependencies();
  runApp(const App());
}
```

### 6. Barrel Files — PREFER Per Feature

```dart
// features/auth/domain/domain.dart (barrel file)
export 'entities/user.dart';
export 'repositories/auth_repository.dart';
export 'usecases/login_usecase.dart';
export 'usecases/logout_usecase.dart';
```

---

## When to Use Each Directory

| Directory    | When to Put Code Here                                    |
| ------------ | -------------------------------------------------------- |
| `core/`      | Used by 3+ features AND contains no business logic       |
| `features/`  | All business logic and feature-specific UI               |
| `shared/`    | UI components or models used by exactly 2+ features      |
| `l10n/`      | All localization strings                                 |

### Moving Code Between Directories

```
1. New code starts in features/<feature>/
2. When a second feature needs it → move to shared/
3. When it's truly infrastructure (no business logic) → move to core/
4. NEVER pre-emptively move to shared/ or core/
```

---

## Quality Checklist

- [ ] Code is organized by feature, not by type
- [ ] Each feature has clear layer separation (data, domain, presentation)
- [ ] No direct imports between feature modules
- [ ] `main.dart` contains only bootstrap code
- [ ] `core/` contains no business logic
- [ ] `shared/` only contains code used by 2+ features
- [ ] All files use `snake_case` naming
- [ ] Test structure mirrors `lib/` structure
- [ ] No file exceeds 300 lines
- [ ] Feature directories are self-contained (deletable without breaking others)
