---
name: documentation
description: Use when writing or updating README, API docs, technical design documents, or inline code comments.
---

# Skill: Documentation

This skill provides standards for creating clear, concise, and maintainable documentation.

## Rules
1. **No Comments in Implementation**: Prefer self-documenting code with clear naming and types over inline comments. Only use comments to explain non-obvious business rules or complex edge cases.
2. **API Documentation**: All public REST/API endpoints must have OpenAPI/Swagger or equivalent documentation describing paths, request bodies, responses, and error schemas.
3. **README Structure**: Every major package (`mobile/`, `backend/`) must have a README with:
   - What the package does
   - Quick start / setup instructions
   - Test and build commands
4. **Technical Design Docs (ADR)**: Major architectural decisions should be recorded as lightweight Architecture Decision Records (ADR) in `docs/adr/`.

## Workflow
1. **Identify What Needs Docs**: New endpoints, changed behavior, new modules.
2. **Write API Specs**: Describe path, method, request/response types, and error codes.
3. **Update README**: If setup steps or scripts changed, update the relevant README.
4. **Record ADR**: If a significant architectural decision was made, write a short ADR documenting the context, decision, and trade-offs.

## Checklists
- [ ] Public API endpoints are documented with request/response schemas.
- [ ] README is up-to-date with install, run, and test instructions.
- [ ] No stale or misleading comments remain in source code.
- [ ] ADR is written for any significant architectural change.
- [ ] Markdown rendering is clean (valid links, headers, code blocks).

## Common Mistakes
- **Comment Rot**: Comments that describe "what" the code does instead of "why", becoming outdated and misleading.
- **Missing Error Documentation**: API docs that only show success responses without documenting error codes and schema.
- **README Out of Sync**: Setup steps that no longer work because dependencies or commands changed but the README was not updated.

## Validation Steps
1. Validate markdown links are not broken.
2. Test README setup instructions from a fresh clone to verify correctness.
3. Run OpenAPI spec through a linter (e.g. `spectral` or `redocly lint`).
