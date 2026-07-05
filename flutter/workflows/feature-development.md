# Flutter Feature Development Workflow

## Base Workflow
Follow `workflows/feature-development.md` as the foundation. This document adds Flutter-specific steps.

---

## Flutter-Specific Steps

### Step 2 (Design) — Flutter Additions

**Widget Tree Design:**
1. Sketch the widget tree before coding
2. Identify which widgets are "smart" (state-aware) vs "dumb" (pure)
3. Decide on state management scope (ephemeral vs feature vs app)

```
// Example widget tree sketch for an Orders screen
OrdersScreen (smart — owns state)
├── OrdersAppBar (dumb)
├── OrdersFilterBar (smart — local filter state)
│   ├── FilterChip × N (dumb)
│   └── SortDropdown (dumb)
├── OrdersList (dumb — receives data)
│   └── OrderCard × N (dumb)
│       ├── OrderStatusBadge (dumb)
│       └── OrderTotalLabel (dumb)
└── CreateOrderFAB (dumb)
```

**State Design:**
```dart
// Define state BEFORE writing widgets
sealed class OrdersState {}
class OrdersInitial extends OrdersState {}
class OrdersLoading extends OrdersState {}
class OrdersLoaded extends OrdersState {
  OrdersLoaded(this.orders);
  final List<Order> orders;
}
class OrdersError extends OrdersState {
  OrdersError(this.message);
  final String message;
}
```

### Step 3 (Plan) — Flutter Build Order

```
1. Domain entities and repository interfaces
2. Data models (DTOs) and repository implementations
3. Use cases / business logic
4. State management (notifier/bloc/provider)
5. Dumb widgets (smallest, reusable UI pieces)
6. Smart widgets (screens that wire state to UI)
7. Navigation (add routes, update router)
8. Integration (dependency injection wiring)
```

### Step 4 (Implement) — Flutter Implementation Checklist

For each widget:
- [ ] `const` constructor
- [ ] Typed constructor parameters
- [ ] `build()` is pure (no side effects)
- [ ] `Key` used where needed (lists, dynamic widgets)
- [ ] Theme values used (no hardcoded colors/sizes)

For each state class:
- [ ] Immutable (all fields `final`)
- [ ] `copyWith` method (for data states)
- [ ] All UI states handled (initial, loading, loaded, empty, error)

For each screen:
- [ ] Route registered in app router
- [ ] Loading state has visual feedback
- [ ] Error state has retry mechanism
- [ ] Empty state has helpful message/illustration
- [ ] Back navigation works correctly

### Step 5 (Verify) — Flutter-Specific Checks

```bash
# Run analyzer
flutter analyze

# Run tests
flutter test

# Check for unused imports, dead code
dart fix --apply

# Test on multiple screen sizes (if possible)
flutter run -d <device>
```

**Manual verification:**
- [ ] Light and dark theme both look correct
- [ ] Scrolling is smooth (no jank)
- [ ] Loading states show correct indicators
- [ ] Error states show and retry works
- [ ] Back button behavior is correct
- [ ] Keyboard doesn't obscure form fields
- [ ] Text scales correctly with accessibility settings

---

## Quick Reference

```
┌─────────────────────────────────────────────────┐
│ FLUTTER FEATURE FLOW                             │
│                                                  │
│ 1. Define state (sealed classes / state objects)  │
│ 2. Build domain layer (entities, repo interfaces) │
│ 3. Build data layer (DTOs, repo implementations)  │
│ 4. Build state management (notifier/bloc)         │
│ 5. Build dumb widgets (bottom-up)                 │
│ 6. Build smart widgets (screens)                  │
│ 7. Register routes                                │
│ 8. Wire dependencies                              │
│ 9. Test (unit → widget → integration)             │
│ 10. Verify (analyze, both themes, accessibility)  │
└─────────────────────────────────────────────────┘
```
