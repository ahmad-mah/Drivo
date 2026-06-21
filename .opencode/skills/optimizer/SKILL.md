---
name: optimizer
description: Use when improving performance, reducing bundle size, optimizing queries, or profiling runtime behavior.
---

# Skill: Optimizer

This skill provides guidance for performance tuning, bundle analysis, and algorithmic efficiency improvements.

## Rules
1. **Measure First**: Never optimize without profiling data or load tests. Use tools like `react-native-flipper`, `@expo/metro-config` bundle analysis, or `clinic.js`.
2. **Big-O Over Micro-Optimizations**: Fix algorithmic complexity (O(N^2) → O(N log N)) before worrying about single-line computation details.
3. **Bundle Impact Awareness**: Adding a dependency or an import can drastically increase the JavaScript bundle size. Always check bundle impact before adding libraries.
4. **Minimize Bridge Crossings**: In React Native, reduce cycle frequency and payload size between JS and Native threads.

## Workflow
1. **Profile & Diagnose**: Use profiling tools, Lighthouse, bundle-visualizer, or database `EXPLAIN ANALYZE`.
2. **Identify Hotspots**: Focus on the running functions, queries, or rendering loops that consume the most time/resources.
3. **Apply Targeted Optimization**: Improve cache layers, memoize expensive computations, add indices, or refactor query strategies.
4. **Re-Profile**: Run profiles again to confirm measurable improvement.

## Checklists
- [ ] Profiling data collected before optimization starts.
- [ ] Algorithmic complexity analyzed and improved if possible.
- [ ] Bundle size verified with `npx expo export --dump-sourcemap` or `source-map-explorer`.
- [ ] Images and assets are compressed, sized appropriately, and lazy-loaded.
- [ ] Re-render performance optimized (React.memo, useMemo, useCallback, or Flutter const constructors).

## Common Mistakes
- **Premature Optimization**: Dramatically complicating logic for marginal performance wins without measuring the actual impact.
- **Ignoring Network Payload**: Adding compression, pagination, or caching at API boundaries is often more impactful than client-side micro-tuning.

## Validation Steps
1. Re-run profiles and confirm measurable improvement.
2. Ensure all tests still pass.
3. Check that error/edge-case behaviors are preserved.
