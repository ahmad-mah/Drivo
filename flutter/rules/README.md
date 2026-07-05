# Flutter Rules

## Purpose

Flutter-specific rules and standards that extend the generic engineering framework. These rules cover Dart language idioms, widget conventions, project structure, testing, and performance that are unique to Flutter development.

## Directory Structure

```
flutter/rules/
├── README.md                 # This file — purpose and overview
├── dart-idioms.md            # Dart 3+ language rules and modern patterns
├── widget-rules.md           # Widget construction and composition rules
├── project-structure.md      # Flutter project organization
├── testing-rules.md          # Flutter-specific testing standards
└── performance-rules.md      # Performance best practices and budgets
```

## Rule Priority

When generic engineering rules conflict with Flutter-specific rules, **Flutter rules take precedence**. Flutter's declarative UI model, widget lifecycle, and rendering pipeline require framework-specific approaches that may differ from general advice.

## Always-Loaded Rules

These rules should be loaded for **every** Flutter task:
1. `dart-idioms.md` — Modern Dart language patterns
2. `widget-rules.md` — Widget best practices
3. `project-structure.md` — Where to put things
