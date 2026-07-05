# Code Organization

## Purpose

Code organization determines how easy it is to find, understand, and modify code. Poor organization forces engineers to hold the entire codebase in memory. Good organization lets you work on one part without thinking about the rest. This skill covers how to structure files, modules, and projects for maximum navigability and minimum cognitive load.

---

## Core Principles

### 1. Organize by Feature, Not by Type

Group related code together by what it does, not by what technical role it plays.

```
# BAD — organized by type (forces jumping between folders)
controllers/
  user_controller
  order_controller
  product_controller
models/
  user_model
  order_model
  product_model
repositories/
  user_repository
  order_repository
  product_repository

# GOOD — organized by feature (everything related is co-located)
features/
  user/
    user_model
    user_repository
    user_controller
  order/
    order_model
    order_repository
    order_controller
  product/
    product_model
    product_repository
    product_controller
```

**Why:** When working on the "order" feature, you open one folder. When organized by type, you open three.

### 2. The Dependency Rule

Dependencies point **inward** — outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────┐
│  Presentation (UI, CLI, API)        │  ← Depends on Application
│  ┌─────────────────────────────┐    │
│  │  Application (Use Cases)    │    │  ← Depends on Domain
│  │  ┌─────────────────────┐    │    │
│  │  │  Domain (Entities,  │    │    │  ← Depends on nothing
│  │  │  Business Rules)    │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- **Domain** knows nothing about databases, UIs, or frameworks
- **Application** orchestrates domain logic but doesn't know about UI
- **Presentation** converts user input into application calls

### 3. One File, One Responsibility

Each file should contain exactly one logical unit. Don't combine unrelated concepts.

```
# BAD — multiple unrelated things in one file
# helpers.ts contains: formatDate, validateEmail, calculateTax, parseCSV

# GOOD — each file has a clear, singular purpose
date_formatter       # formatDate, formatDateTime, formatRelativeTime
email_validator      # validateEmail, validateEmailDomain
tax_calculator       # calculateTax, calculateTaxBracket
csv_parser           # parseCSV, parseCSVRow
```

### 4. Flat Over Nested

Avoid deeply nested directory structures. If you need more than 3 levels of nesting, flatten the structure.

```
# BAD — too deeply nested
src/modules/user/features/profile/components/forms/inputs/email/

# GOOD — flat enough to navigate
src/features/user-profile/
  components/
  models/
  services/
```

---

## Standard Project Structure

```
project_root/
├── src/                          # All source code
│   ├── core/                     # Shared infrastructure (logging, networking, config)
│   │   ├── errors/               # Base error types
│   │   ├── config/               # Configuration loading
│   │   └── utils/                # Truly generic utilities (max 5-10 functions)
│   ├── features/                 # Feature modules (the bulk of the app)
│   │   ├── <feature_a>/
│   │   │   ├── models/           # Data structures for this feature
│   │   │   ├── services/         # Business logic for this feature
│   │   │   ├── repositories/     # Data access for this feature
│   │   │   └── presentation/     # UI or API layer for this feature
│   │   └── <feature_b>/
│   └── shared/                   # Code shared between 2+ features
│       ├── models/               # Shared data structures
│       └── services/             # Shared business logic
├── tests/                        # Test files (mirrors src/ structure)
├── docs/                         # Documentation
├── scripts/                      # Build/deploy/automation scripts
└── config/                       # Environment configuration files
```

### Rules for This Structure

1. **`core/`** — Used by many features but contains no business logic. Changes here affect the whole system.
2. **`features/`** — Each feature is independent. Features should not import from other features directly.
3. **`shared/`** — Only code genuinely needed by 2+ features. Start in `features/`, move to `shared/` when the second use appears.
4. **`tests/`** — Mirror the source structure so tests are easy to find.

---

## Module Boundaries

### What Makes a Good Module

A module is a group of code that:
- Has a **clear public interface** (what it exports)
- **Hides internal implementation** (what it keeps private)
- Can be **understood in isolation** (doesn't require knowledge of other modules)
- Has **high cohesion** (everything inside is closely related)
- Has **low coupling** (minimal dependencies on other modules)

### Module Communication

Modules should communicate through well-defined interfaces, not by reaching into each other's internals.

```
# BAD — module A reaches into module B's internals
from features.orders.internal.database_queries import raw_order_query

# GOOD — module A uses module B's public interface
from features.orders import OrderService
order_service.get_order_by_id(order_id)
```

### Index/Barrel Files

Each module should have an entry point that explicitly declares its public API.

```
# features/orders/index (or __init__, or barrel file)

# Public API — these are the only things other modules should use
export OrderService
export Order
export OrderStatus
export OrderNotFoundError

# Everything else in this directory is internal implementation
```

---

## Anti-Patterns

### 1. The God Module
```
# ANTI-PATTERN — one module that does everything
src/
  app.ts  # 5000 lines: routing, auth, database, business logic, email...
```
**Fix:** Extract each responsibility into its own module.

### 2. The Junk Drawer
```
# ANTI-PATTERN — utils/helpers that grows unbounded
utils/
  helpers.ts     # 2000 lines of unrelated functions
  common.ts      # Another 1500 lines
  misc.ts        # Even more
```
**Fix:** Move each function to the module it logically belongs to.

### 3. Circular Dependencies
```
# ANTI-PATTERN
# orders/ imports from users/
# users/ imports from orders/
```
**Fix:** Extract the shared concept into a third module, or invert the dependency with an interface.

### 4. Premature Shared Code
```
# ANTI-PATTERN — moving code to shared/ before a second use case exists
shared/
  format_user_name.ts  # Only used by the user feature
```
**Fix:** Keep code in its feature module until genuinely needed elsewhere. Then move it.

### 5. Layer-Per-File Instead of Layer-Per-Feature
```
# ANTI-PATTERN — one layer containing all features
models/
  user.ts         # Unrelated to order.ts
  order.ts        # Unrelated to product.ts
  product.ts
```
**Fix:** Co-locate model, service, and repository within each feature directory.

---

## Decision Rules

1. **Where should this file go?** → Which feature does it belong to? Put it there. If it belongs to no feature, it might belong in `core/`. If it belongs to 2+ features, it goes in `shared/`.
2. **Should I create a new module?** → Does this group of code have a clear public API and hidden internals? If yes, make it a module. If it's just one function, add it to an existing module.
3. **How deep should my directories be?** → Maximum 3 levels under `src/`. If deeper, flatten.
4. **Should this be in `utils`?** → Probably not. Find the domain concept it belongs to and put it there. Only truly generic, domain-free functions (string padding, date formatting) go in utils.
5. **When should I split a file?** → When it exceeds ~200-300 lines, or when it contains two concepts that change for different reasons.

---

## Quality Checklist

- [ ] Code is organized by feature, not by technical layer
- [ ] No file exceeds ~300 lines
- [ ] No directory exceeds ~10-15 files (not counting subdirectories)
- [ ] Dependencies only point inward (presentation → application → domain)
- [ ] No circular dependencies between modules
- [ ] Each module has a clear public API (index/barrel file or equivalent)
- [ ] `utils/` or `helpers/` contains fewer than 10 truly generic functions
- [ ] `shared/` only contains code used by 2+ features
- [ ] Test structure mirrors source structure
- [ ] A new developer can find any piece of code within 30 seconds

---

## Common Mistakes

| Mistake                                | Consequence                             | Fix                                      |
| -------------------------------------- | --------------------------------------- | ---------------------------------------- |
| Organizing by type instead of feature  | Context-switching between folders       | Group related files by feature           |
| Growing `utils` endlessly              | Junk drawer nobody maintains            | Move functions to their domain modules   |
| Deeply nested directories              | Hard to navigate, long import paths     | Flatten to max 3 levels                  |
| No public API definition for modules   | Everyone imports internal implementation| Add index files declaring public API     |
| Moving to `shared/` too early          | Unnecessary coupling, premature abstraction | Wait for the second genuine use case  |

---

## Acceptance Criteria

Code organization is acceptable when:

1. A developer unfamiliar with the project can find any component within 30 seconds
2. Adding a new feature does not require modifying existing feature modules
3. Removing a feature is a clean directory deletion (no scattered references)
4. Each module can be understood by reading only its public API
5. The directory structure itself documents the system's architecture
