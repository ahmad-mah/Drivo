---
name: state-management
description: Use when selecting or implementing state management for React Native or Flutter apps, or when migrating between state management libraries.
---

# Skill: State Management

This skill provides guidance for selecting and implementing state management across React Native and Flutter.

## Recommended Defaults

| Platform | Default               | When to Switch              |
|----------|-----------------------|-----------------------------|
| RN/Expo  | **Zustand**           | Redux for large teams/audit trails |
| Flutter  | **Riverpod**          | BLoC for complex event streams |

## Trade-offs

### React Native

| Library   | Pros                                      | Cons                                       |
|-----------|-------------------------------------------|--------------------------------------------|
| **Zustand** | Minimal boilerplate, no providers, easy TypeScript integration | No built-in side-effect middleware |
| **Redux Toolkit** | DevTools, normalized cache, RTK Query | Heavy boilerplate even with Toolkit, harder migration |
| **React Context** | Built-in, no deps | Re-renders entire tree on state changes, not for frequent updates |

### Flutter

| Library   | Pros                                      | Cons                                       |
|-----------|-------------------------------------------|--------------------------------------------|
| **Riverpod** | Compile-safe, no `BuildContext` needed for reads, testable | Newer ecosystem, fewer community examples |
| **BLoC** | Well-structured event/state streams, great for complex flows | Significant boilerplate (events, states, bloc classes) |
| **Provider** | Simple, widely known | Deprecated in favor of Riverpod, less safe |

## Rules (Applicable to both)

1. **Keep state as local as possible**: Only lift state to a global store when it needs to be shared across unrelated components.
2. **Separate UI state from server state**: Use Zustand/Riverpod for UI state; use React Query/SWR or Riverpod's `AsyncNotifier` for server cache.
3. **No direct mutation**: State must be updated through immutable patterns (Zustand's `set`, Riverpod's `state = ...`, reducers).
4. **Testability**: All store logic should be testable without rendering UI widgets.

## Workflow
1. **Identify state scope**: Local (useState/useReducer), shared (Zustand/Riverpod), server (React Query/Riverpod FutureProvider).
2. **Define store structure**: Create a store slice for each domain feature.
3. **Implement actions**: Expose methods/actions that update state.
4. **Connect to UI**: Subscribe components to relevant slices/providers.

## Checklists
- [ ] State is scoped to the minimum required context.
- [ ] Server state is cached and invalidated properly (not stored alongside UI state).
- [ ] Store slices are independent and not deeply nested.
- [ ] No provider nesting hell: Provider wrappers are minimized.

## Common Mistakes
- **Global Store Everything**: Moving all state (including form input fields) to a global store, causing unnecessary re-renders.
- **Mixing Server and UI State**: Caching API data in the same store as UI toggles, making cache invalidation complex.
- **Selectors Returning New Objects**: Creating new object/array references in selectors on every call, defeating memoization.

## Validation Steps
1. Verify devtools (Zustand/Redux DevTools or Riverpod DevTools) are configured in development.
2. Confirm no unnecessary re-renders using React Profiler or Flutter DevTools rebuild counts.
3. Test that store state resets correctly between user sessions.
