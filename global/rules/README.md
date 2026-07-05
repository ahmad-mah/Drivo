# Engineering Rules

## Purpose

This directory contains **enforceable engineering rules** — the principles, standards, and constraints that every piece of code must satisfy. Unlike skills (which teach how), rules define **what** must be true for code to be considered acceptable.

Rules are non-negotiable quality gates. They exist to prevent the most common and costly engineering mistakes before they reach production.

## Directory Structure

```
rules/
├── README.md                     # This file — purpose and overview
├── solid-principles.md           # SOLID applied pragmatically
├── clean-code.md                 # Code clarity and readability standards
├── architecture-boundaries.md    # Layer separation and dependency direction
├── complexity-management.md      # KISS, YAGNI, and complexity budgets
├── dry-principles.md             # DRY without overengineering
└── code-review-standards.md      # What to enforce in code review
```

## How to Use These Rules

1. **Before submitting code**, verify it passes the relevant rules' checklists.
2. **During code review**, cite specific rules when requesting changes.
3. **When debating approaches**, use rules as objective tiebreakers.
4. **When onboarding**, introduce rules as the team's shared quality standard.

## Rule Severity Levels

| Level         | Meaning                                       | Example                              |
| ------------- | --------------------------------------------- | ------------------------------------ |
| **MUST**      | Violation is a blocking defect                 | No circular dependencies             |
| **SHOULD**    | Violation requires justification               | Functions under 20 lines             |
| **PREFER**    | Recommended but flexible                       | Immutable data structures            |

## Relationship to Other Directories

| Directory    | Contains              | Answers           |
| ------------ | --------------------- | ----------------- |
| `skills/`    | Techniques & patterns | **How** to do it  |
| `rules/`     | Principles & standards| **What** to enforce|
| `workflows/` | Processes & sequences | **When** to do it |
