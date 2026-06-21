---
name: builder
description: Use when building features, components, classes, or application logic across React Native (Expo), Flutter (Dart), or Node.js (Express/NestJS).
---

# Skill: Builder

This skill provides opinionated engineering directives and workflows for building robust components and features.

## Rules
1. **Type Definition First**: Define types, interfaces, or class models before implementing the concrete logic.
2. **Strict Component Isolation**: UI components must do one thing. Keep logic separated into custom hooks or controllers.
3. **Handle Loading and Error States**: Every UI or backend service must handle pending and error states elegantly.
4. **Use Established Tooling**: Always use existing build or run commands (e.g. `npm run build`, `flutter build`).

## Workflow
1. **Scaffold / Define Interfaces**: Create necessary TS types, schemas, or Dart interfaces.
2. **Implement Business Logic**: Write pure functions, services, or custom hooks.
3. **Implement UI Components**: Hook business logic up to presentation layers using React Native or Flutter widgets.
4. **Test & Verify**: Run component tests and confirm state changes.

## Checklists
- [ ] No `any` types or dynamic types without safety bounds.
- [ ] UI components are decoupled from raw network/data source fetching.
- [ ] Proper dependency injection used (e.g., NestJS, Riverpod, or React Context).
- [ ] Assets and icons are managed systematically.
- [ ] Code compiles without warnings.

## Common Mistakes
- **Leaky Abstractions**: Letting database or network exceptions bubble directly into the presentation layer without mapping them to readable domain errors.
- **Giant UI Files**: Putting thousands of lines of layout, state, styling, and networking inside a single React component or Flutter widget.

## Validation Steps
1. Run compilation/type-checks (`tsc` or `flutter analyze`).
2. Run unit tests (`npm test` or `flutter test`).
3. Verify on targeted device simulator/emulator or using postman/curl if backend.
