---
name: git-workflow
description: Use when creating commits, branching, opening PRs, or following the project's version control conventions.
---

# Skill: Git-Workflow

This skill defines the project's Git conventions for branch naming, commit messages, and pull request workflows.

## Rules
1. **Branch Naming**: Use `type/description` format. Types: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `test/`. Example: `feat/add-expense-categories`.
2. **Conventional Commits**: Every commit message must follow the conventional commits specification: `type(scope): description`. Example: `feat(expenses): add category filter`.
3. **Atomic Commits**: Each commit should represent a single logical change. Avoid combining formatting changes with logic changes.
4. **No Direct Main Commits**: All changes must go through feature branches and pull requests.

## Workflow
1. **Create Branch from Main**: `git checkout -b feat/your-feature`.
2. **Make Atomic Commits**: Commit related changes with conventional commit messages.
3. **Run Lint & Tests**: Ensure all checks pass before opening PR.
4. **Open PR with Title**: Use the same conventional commit style for PR title.
5. **Request Review**: Tag relevant reviewers and describe what the PR does.

## Checklists
- [ ] Branch name follows `type/description` convention.
- [ ] Commit messages follow conventional commits.
- [ ] No large files or secrets committed.
- [ ] PR description clearly states what and why.
- [ ] Lint and tests pass before requesting review.

## Common Mistakes
- **Messy Commit History**: "fix", "fix2", "fix3" commits rather than squashing into one atomic fix.
- **Merging Without Review**: Pushing directly to main or merging PRs without review.
- **Commit Message Noise**: Using messages like "update file.ts" without explaining the reason for the change.

## Validation Steps
1. Check `git log --oneline` for clean history.
2. Verify no `.env` or secrets in the commit history.
3. Confirm CI checks pass on the PR.
