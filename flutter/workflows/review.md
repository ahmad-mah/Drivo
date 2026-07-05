# Flutter Code Review Checklist

## Base Workflow
Follow `rules/code-review-standards.md` for general review process. This document adds Flutter-specific review criteria.

---

## Flutter Review Checklist

### Widget Quality

- [ ] `build()` methods are pure — no side effects, no async calls
- [ ] `const` on all eligible constructors and widget instantiations
- [ ] Widgets extracted as classes (not `_build*()` helper methods)
- [ ] `StatefulWidget` used only when local mutable state is required
- [ ] One public widget per file
- [ ] Widget files ≤ 200 lines
- [ ] `build()` nesting ≤ 5 levels
- [ ] `Key` used on list items and dynamic widgets
- [ ] `super.key` used (not old-style Key parameter)

### State Management

- [ ] State separated from UI (notifier/bloc/controller ≠ widget)
- [ ] State objects are immutable (all fields `final`)
- [ ] All UI states handled (initial, loading, loaded, empty, error)
- [ ] `setState` used only for ephemeral single-widget state
- [ ] No `BuildContext` passed to state management classes
- [ ] State scoped to feature level (not everything at app root)
- [ ] Controllers and subscriptions disposed properly

### Performance

- [ ] Lists use `.builder` constructors
- [ ] Images resized to display dimensions
- [ ] No computation in `build()` (filtering, sorting, formatting)
- [ ] No object creation in `build()` that could be const/static
- [ ] `mounted` checked before `setState` after async gaps

### Dart Idioms

- [ ] Pattern matching used for type switching (not if-else chains)
- [ ] Sealed classes for state hierarchies
- [ ] No `dynamic` types
- [ ] No unnecessary `!` (bang) operators
- [ ] `final` used for non-reassigned variables
- [ ] Constants use `lowerCamelCase`
- [ ] Public APIs have `///` documentation

### Navigation

- [ ] Routes defined as constants (no hardcoded strings in push calls)
- [ ] Deep-linkable data uses path/query params (not `extra`)
- [ ] Auth guards in router redirect, not in widgets
- [ ] Error route defined

### Theming

- [ ] No hardcoded colors — uses `colorScheme`
- [ ] No hardcoded text styles — uses `textTheme`
- [ ] Spacing uses defined constants
- [ ] Works in both light and dark themes

### Testing

- [ ] Unit tests for business logic
- [ ] Widget tests for interactive behavior
- [ ] Tests use Key-based finders
- [ ] Loading, error, and empty states are tested
- [ ] Mocks for external dependencies (not real network/DB)

---

## Red Flags (Blocking Issues)

| Red Flag                                    | Why It Blocks                             |
| ------------------------------------------- | ----------------------------------------- |
| Side effects in `build()`                   | Causes bugs, fires on every rebuild       |
| Missing `dispose()` for controllers         | Memory leak in production                 |
| `setState` after dispose without `mounted`  | Production crash                          |
| Future created inside `build()`             | Re-fetches data on every rebuild          |
| No error handling in async operations       | Silent failures, blank screens            |
| `dynamic` types in public APIs              | No compile-time safety                    |
| Hardcoded strings for navigation routes     | Silent failures on typos                  |

---

## Green Flags (Praise-Worthy)

| Green Flag                                  | Why It's Good                             |
| ------------------------------------------- | ----------------------------------------- |
| Exhaustive switch on sealed state classes   | Compiler catches missing cases            |
| Immutable state with `copyWith`             | Predictable, debuggable state changes     |
| `const` used throughout                     | Maximum performance with zero effort      |
| Smart/dumb widget separation                | Reusable, testable components             |
| Error states with retry actions             | Good UX, resilient app                    |
