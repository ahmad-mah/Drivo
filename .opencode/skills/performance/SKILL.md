---
name: performance
description: Use when profiling, diagnosing performance bottlenecks, optimizing rendering, queries, caching, or build times.
---

# Skill: Performance

This skill brings together best practices for performance tuning across mobile (React Native, Flutter) and backend (Node.js, PostgreSQL).

## Rules

### Mobile (React Native / Flutter)
1. **Target 60 FPS**: Avoid jank by keeping the main thread free. Offload heavy computations to worklets (Reanimated) or isolates (Flutter).
2. **Minimize Re-renders**: Use `React.memo`, `useMemo`, `useCallback` for React Native. Use `const` constructors and `RepaintBoundary` for Flutter.
3. **FlatList / ListView Optimization**: Use `getItemLayout`, `keyExtractor`, and `windowSize` for long lists. Avoid anonymous inline functions in render items.
4. **Image Optimization**: Use `expo-image` for caching, BlurHash placeholders, and responsive image sizing. Never load full-resolution images in lists.

### Backend (Node.js + Express/NestJS)
1. **Database Query Optimization**: Ensure all query `WHERE` clauses use indexed columns. Use `EXPLAIN ANALYZE` to verify query plans.
2. **Connection Pooling**: Use a connection pool (e.g. `pg.Pool`, `prisma`, `typeorm`) instead of creating new connections per request.
3. **Response Caching**: Add HTTP caching headers (`ETag`, `Cache-Control`) for read endpoints that don't change frequently.
4. **Rate Limiting**: Protect resource-intensive endpoints with rate limiting (e.g. `express-rate-limit`).

### General
1. **Bundle Size Optimization**: Use `expo export --dump-sourcemap` to analyze JS bundle. Lazy-load screens and components. Remove unused imports.
2. **Lazy Initialization**: Initialize heavy services (DB connections, AI models, file parsers) on first use, not at application startup.

## Workflow
1. **Identify Performance Issue**: Use profiling (React DevTools Profiler, Flutter DevTools, Node.js `clinic.js`, `EXPLAIN ANALYZE`).
2. **Formulate Hypothesis**: Pinpoint the suspected bottleneck (re-render, query, network payload).
3. **Apply Optimization**: Implement the targeted fix.
4. **Re-measure**: Confirm improvement with the same profiling tool.

## Checklists
- [ ] Re-renders minimized (React.memo, const widgets).
- [ ] List views optimized with proper keys and virtualization settings.
- [ ] Database queries use indexes and are verified with `EXPLAIN ANALYZE`.
- [ ] Bundle size analyzed; lazy loading applied to non-critical routes.
- [ ] HTTP caching headers applied to read-heavy endpoints.
- [ ] Images are properly sized and cached.

## Common Mistakes
- **Over-Optimizing Early**: Applying complex memoization and caching layers before profiling confirms the need.
- **N+1 Queries**: Loading a list of entities and then making separate queries for each entity's relations. Use JOIN or batch loading (DataLoader).
- **Ignoring Startup Time**: Adding heavy initialization (API calls, file reads) to application startup rather than deferring to the first screen that needs it.

## Validation Steps
1. Re-run profiler tool and confirm the specific metric improved.
2. Run load test (e.g. `k6`, `artillery`) for critical API endpoints.
3. Verify the app loads on a mid-range device and maintains 60 FPS for the optimized flow.
