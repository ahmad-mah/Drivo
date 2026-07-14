# Git Conventions

## Commit Messages

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type       | Use for                                |
| ---------- | -------------------------------------- |
| `feat`     | New feature                            |
| `fix`      | Bug fix                                |
| `refactor` | Improve code without changing behavior |
| `perf`     | Performance improvements               |
| `docs`     | Documentation only                     |
| `style`    | Formatting only (no logic changes)     |
| `test`     | Add/update tests                       |
| `build`    | Build system changes                   |
| `ci`       | CI/CD                                  |
| `chore`    | Maintenance, configs                   |
| `revert`   | Revert previous commit                 |

### Rules

- Always include a scope when possible.
- Imperative mood, lowercase, no period.
- Subject ≤ 72 characters.
- Describe **what** changed, not how.
- Add a body when the reason isn't obvious.
- One commit = one logical change.
- Never mix refactoring, features, and fixes in the same commit.

### Breaking Changes

```
feat(api)!: remove legacy endpoint

BREAKING CHANGE: migrate to new API.
```

---

## Branch Names

```
feature/<name>
bugfix/<name>
hotfix/<name>
refactor/<name>
docs/<name>
test/<name>
release/<version>
```

---

## Pull Requests

- Title follows same format as commits: `type(scope): description`
- Prefer **squash and merge** to keep history clean.
- Use the PR description template for bodies.

---

## AI Agent Instructions

When using an AI coding agent, provide these rules:

- Follow Conventional Commits.
- Every commit must represent one logical change.
- Never use vague messages like "update", "fix", or "changes".
- Include a scope whenever possible.
- Use imperative mood.
- Keep subject under 72 characters.
- Add a body when the reason is not obvious.
- Mention breaking changes explicitly.
- Prefer squash merge.
