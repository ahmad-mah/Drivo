# Flutter Skills

## Purpose

Flutter-specific engineering skills that extend the generic engineering framework. Each skill covers a Flutter concept with enough depth for an AI agent to implement correctly without ambiguity.

## Directory Structure

```
flutter/skills/
├── SKILL.md                      # This file — purpose and overview
├── widget-composition.md         # Building UIs with composable widgets
├── state-management.md           # Managing application state
├── navigation-routing.md         # Navigation and deep linking
├── async-patterns.md             # Futures, Streams, Isolates
├── theming-styling.md            # Material 3, responsive design
├── performance-optimization.md   # Build optimization, profiling
└── platform-integration.md       # Platform channels, plugins, native code
```

## Skill Loading Guide

| Skill                       | Load When                                          |
| --------------------------- | -------------------------------------------------- |
| `widget-composition`        | Building any UI component or screen                |
| `state-management`          | Adding reactive state or business logic            |
| `navigation-routing`        | Adding screens, deep links, or navigation logic    |
| `async-patterns`            | Working with APIs, databases, or background tasks  |
| `theming-styling`           | Designing themes, colors, typography, responsiveness|
| `performance-optimization`  | Investigating jank, optimizing rebuilds             |
| `platform-integration`      | Calling native platform APIs or creating plugins   |

## Prerequisites

All skills assume familiarity with:
- The generic engineering framework (`skills/`, `rules/`, `workflows/`)
- `flutter/rules/dart-idioms.md` — Dart language patterns
- `flutter/rules/widget-rules.md` — Widget best practices
