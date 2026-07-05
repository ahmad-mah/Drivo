# React Native Rules

## Purpose

React Native-specific rules and standards that extend the generic engineering framework. These rules cover React and TypeScript idioms, component constraints, project structure, and performance best practices.

## Directory Structure

```
react-native/rules/
├── README.md                 # This file — purpose and overview
├── react-idioms.md           # React 18+ and TypeScript language rules
├── component-rules.md        # Rules for building React components
├── project-structure.md      # React Native/Expo project organization
├── testing-rules.md          # Jest and React Native Testing Library
└── performance-rules.md      # Rendering budgets and list optimization
```

## Rule Priority

When generic engineering rules conflict with React Native-specific rules, **React Native rules take precedence**. React's declarative nature, hook lifecycle, and the asynchronous bridge to native UI require framework-specific approaches that differ from general imperative programming advice.

## Always-Loaded Rules

These rules should be loaded for **every** React Native task:
1. `react-idioms.md` — Hook rules, dependency arrays, TS strictness
2. `component-rules.md` — Prop definitions, purity, component size
3. `project-structure.md` — Where to place files and assets
