---
name: flutter
description: Use when building Flutter features, widgets, state management with BLoC or Riverpod, or writing Dart code.
---

# Skill: Flutter

This skill provides standards for Flutter/Dart code, state management, widget architecture, and Dart-specific patterns.

## Rules
1. **Sound Null-Safety**: All Dart code must use sound null-safety. Avoid `late` keyword when possible; prefer constructor initialization or `required` parameters.
2. **State Management (Default: Riverpod)**: Use `flutter_riverpod` for state management. Prefer `StateNotifierProvider` or `AsyncNotifierProvider` for complex business logic. Declare providers as top-level final variables.
3. **Widget Composition**: Keep widgets small and composable. Extract reusable widgets into separate files in `src/widgets/`. Use `const` constructors for widgets where possible.
4. **Avoid `BuildContext` Leaks**: Never pass `BuildContext` across async gaps. Use `context.mounted` checks or capture `ScaffoldMessenger` / `NavigatorState` before `await`.
5. **Folder Structure**: Follow feature-first structure: `src/features/<name>/` with sub-folders `domain/`, `data/`, `presentation/`.

## Workflow
1. **Define Data Models**: Create Dart classes with `freezed` for immutability and JSON serialization.
2. **Create Repositories**: Define abstract repository interfaces in domain, implement them in data.
3. **Create Providers**: Write Riverpod providers exposing ViewModels or async data.
4. **Build UI Widgets**: Use `ConsumerWidget` or `ConsumerStatefulWidget` to reactively rebuild on state changes.
5. **Add Routing**: Use `go_router` for declarative routing with deep link support.

## Checklists
- [ ] All models use `freezed` for immutability and `json_serializable`.
- [ ] Providers are top-level, not defined inside build methods.
- [ ] Widgets are `const` constructors where possible.
- [ ] No `BuildContext` used after async gaps without mounting check.
- [ ] `flutter analyze` passes with zero warnings.

## Common Mistakes
- **Riverpod Provider Scope**: Defining providers inside `build()` methods, causing them to be recreated on every rebuild.
- **Forgetting `ref.watch` vs `ref.read`**: Watching providers during event handlers (should use `ref.read` for callbacks).
- **Deep Widget Nesting**: Building widget trees with excessive nesting (50+ levels) causing rebuild performance issues.

## Validation Steps
1. Run `flutter analyze` and resolve all warnings/errors.
2. Run `flutter test` and verify suite passes.
3. Test on both iOS and Android simulators.
