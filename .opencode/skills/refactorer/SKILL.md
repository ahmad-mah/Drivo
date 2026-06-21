---
name: refactorer
description: Use when refactoring, cleaning up technical debt, modularizing, or streamlining existing code without changing its external behavior.
---

# Skill: Refactorer

This skill guides the agent through systematic refactoring to improve readability, reuse, and flexibility while preserving correct external behaviors.

## Rules
1. **Safety First (Existing Tests)**: Never refactor code without run-testing the current implementation first to understand behaviors. If tests do not exist, write them before refactoring.
2. **Apply SOLID Principles**:
   - *Single Responsibility*: A module/class should have only one reason to change.
   - *Open/Closed*: Open for extension, closed for modification.
   - *Liskov Substitution*: Subtypes must be substitutable for their base types.
   - *Interface Segregation*: Prefer many small client-specific interfaces.
   - *Dependency Inversion*: Depend on abstractions, not concretions.
3. **Keep DRY (Don't Repeat Yourself)**: Extract common logic, utilities, and components into testable shared modules.
4. **Make Atomic Commits**: Refactor in distinct steps. Do not mix structural refactoring with major new features in the same commit.

## Workflow
1. **Analyze Current Implementation**: Trace usage, imports, and execution dependencies.
2. **Review Test Coverage**: Run existing tests or add minimal regression coverage.
3. **Execute Small Transformations**: Apply rename, extract method, split component, or introduce interface.
4. **Verify Behavior**: Run tests after each small change.
5. **Lint and Type-Check**: Clean up any remaining formatting or typings.

## Checklists
- [ ] Existing tests run and pass BEFORE refactoring.
- [ ] SOLID/DRY violations analyzed and resolved.
- [ ] Interfaces introduced where appropriate to mock dependencies.
- [ ] Complex branches simplified into guard clauses or dedicated routines.
- [ ] All tests run and pass AFTER refactoring.

## Common Mistakes
- **Scope Creep**: Implementing a new feature while trying to rewrite a module. Keep them separated!
- **Over-Engineering**: Creating multi-layer abstractions and wrappers for extremely simple logic.
- **Breaking Public Contracts**: Changing function signatures or parameters that are imported in dozens of other files without checking them first.

## Validation Steps
1. Execute full project test commands.
2. Validate linter and build logs to ensure no warnings or type breaks remain.
