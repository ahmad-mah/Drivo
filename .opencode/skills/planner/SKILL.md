---
name: planner
description: Use when initiating a new feature, major refactoring, or a multi-step engineering task to design the roadmap and architecture before writing code.
---

# Skill: Planner

This skill guides the agent through systematic planning, architectural scoping, and task decomposition before touching a line of code.

## Rules
1. **Never skip planning**: For any task requiring changes to multiple files or complex state, write a clear, concise plan first.
2. **Consult dependencies**: Scan `package.json`, `pubspec.yaml`, or equivalent config files to confirm packages before incorporating them into the plan.
3. **Verify APIs first**: If integrating with backend or third-party APIs, verify the endpoint contracts, request/response models, and error behaviors.
4. **Prefer incremental steps**: Design plans to be executed in small, verifiable, and logical increments.

## Workflow
1. **Analyze Requirements**: Gather the goals, scope, and non-functional requirements.
2. **Inspect Current State**: Glob/grep existing files and read relevant modules to understand how the feature fits.
3. **Draft High-Level Architecture**: Decide which design patterns, folders, and interfaces to introduce.
4. **Define Task Breakdown**: List granular tasks using a task list (`todowrite`).
5. **Establish Verification Criteria**: Specify how each task will be tested (unit, integration, manual).

## Checklists
- [ ] Requirements clearly understood and scoped.
- [ ] Existing codebase examined for patterns and style.
- [ ] External dependencies validated and installed.
- [ ] Database/state schema modifications defined.
- [ ] Step-by-step tasks mapped out with clear priorities.
- [ ] Validation strategy defined for each sub-task.

## Common Mistakes
- **Underestimating Impact**: Modifying a model or shared class without checking all its reference locations first (use `grep`!).
- **Adding Unnecessary Packages**: Proposing third-party libraries when built-in features or existing utilities can suffice.
- **Vague Plans**: Creating a plan like "1. Write code, 2. Run tests" instead of detailing specific functions, classes, and paths.

## Validation Steps
1. Review the plan against architectural and coding standards.
2. Confirm the plan does not violate security rules (no hardcoded secrets/keys).
3. Ensure there is a dedicated verification step for each sub-task.
