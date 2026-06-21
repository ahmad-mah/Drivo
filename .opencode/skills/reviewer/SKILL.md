---
name: reviewer
description: Use when conducting PR code reviews, pre-commit checks, or analyzing code quality and style adherence.
---

# Skill: Reviewer

This skill guides the agent in reviewing code for readability, maintainability, performance, security, and architectural correctness.

## Rules
1. **Be constructive and objective**: Focus on the code, its structures, and its implications, avoiding personal opinions.
2. **Review for correctness first**: Ensure the code correctly implements the specified feature or bugfix.
3. **Analyze Edge Cases**: Actively seek out edge cases like null bounds, network timeouts, and race conditions.
4. **Ensure compliance**: Check if changes match the repository’s style and architecture patterns (Clean Architecture, Sound Types).

## Workflow
1. **Analyze Diff**: Carefully inspect git diffs, changed files, and import shifts.
2. **Scan for Coding Violations**: Look for anti-patterns (no magic numbers, missing type safety, duplicate code).
3. **Evaluate Architecture Alignment**: Ensure logic is properly segmented (domain is pure, UI is dumb, data layers handle adapters).
4. **Inspect Security Posture**: Ensure no secrets, cleartext credentials, or injection vulnerabilities are introduced.
5. **Formulate Actionable Feedback**: Provide a structured critique detailing what to change, why, and a recommended refactored snippet.

## Checklists
- [ ] Code meets TypeScript/Dart typings without fallback to `any` / dynamic.
- [ ] Logic respects Clean Architecture separations.
- [ ] No hardcoded secrets or credentials are present.
- [ ] Error handling is complete and informative.
- [ ] Adequate test coverage exists for modified behavior.
- [ ] Code formatting is uniform and correct.

## Common Mistakes
- **Style Nitpicking Over Correctness**: Spending more time on spaces or semi-colons rather than finding race conditions, memory leaks, or logical flaws.
- **Ignoring Scale**: Approving queries or loops that perform poorly on large datasets (O(N^2) or missing indices).

## Validation Steps
1. Run linter (`npm run lint` or `flutter analyze`).
2. Run test suites.
3. Confirm build finishes with zero errors.
