---
name: testing
description: Use when writing or running unit tests, integration tests, end-to-end tests, or analyzing test coverage for mobile and backend code.
---

# Skill: Testing

This skill provides standards for test-driven development, test structure, and verification across all targets.

## Rules
1. **Test Types (ordered by preference)**:
   - Unit Tests (~70%): Cover pure business logic, domain use-cases, and utility functions.
   - Integration Tests (~20%): Cover repository + database interactions and API endpoint contracts.
   - E2E Tests (~10%): Cover critical user flows (login, create expense, logout).
2. **Arrange-Act-Assert Pattern**: Every test must follow AAA structure for clarity.
3. **Descriptive Naming**: `describe('ModuleName')` and `it('should ... when ...')`.
4. **Mock External Boundaries**: Mock API clients, database connections, and platform modules. Never mock domain entities.

## Workflow
1. **Identify Test Targets**: List critical functions, use-cases, and repositories.
2. **Write or Update Tests**: Follow AAA pattern, mock dependencies, test edge cases.
3. **Run Test Suite**: Execute `npm test`, `jest`, or `flutter test` and ensure green.
4. **Check Coverage**: Verify coverage thresholds are met (target >80%).

## Checklists
- [ ] AAA pattern consistently used.
- [ ] Mocks are scoped per test file, not shared globally.
- [ ] Tests cover success, failure, and loading states.
- [ ] No flaky tests relying on real network connections or timing.
- [ ] Code coverage is computed and reported.

## Common Mistakes
- **Testing Implementation Details**: Writing tests that assert internal state of a component instead of public API behavior.
- **Over-Mocking**: Mocking every dependency rather than accepting real domain logic, leading to brittle tests.
- **Flaky E2E Tests**: Using hard-coded sleeps/delays instead of waiting for element selectors.

## Validation Steps
1. Run full test suite and confirm zero failures.
2. Verify test output includes coverage report.
3. Review that edge-case tests exist for nulls, empty arrays, and error states.
