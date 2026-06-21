# OpenCode Agent Architecture

This file governs all OpenCode agents and subagents operating in this repository. It defines core philosophy, context policies, safety constraints, and decision-making principles.

## 1. Core Engineering Philosophy

* **Pragmatism Over Dogma**: Build exactly what is needed with high-quality, typed, and well-tested code. Prefer simple, readable, and maintainable structures.
* **Type Safety as a Constraint**: All TS/JS code must have rigorous TypeScript typings. No `any` or loose typings unless technically unavoidable. All Dart/Flutter code must use sound null-safety.
* **Clean Architecture**: Decouple business logic (Domain) from presentation (UI) and infrastructure/data sources. Depend on abstractions, never on details.
* **Zero-Warning Tolerance**: Code changes must not introduce linter warnings, TypeScript errors, or compile issues.
* **Explicit Dependency Management**: Never introduce libraries without existing usage or direct authorization.

## 2. Context Policy

* **Minimal Context Footprint**: To optimize token usage and avoid long-term maintainability degradation, keep global rules to a minimum.
* **Lazy-Loaded Skills**: Do not inject global instructions for specific domains. Instead, load specialized skills (e.g. `react-native`, `nodejs`, `clean-architecture`) only when actively working on that domain.
* **Context Preservation**: Avoid repeating boilerplate in conversations. State the task, execute targeted actions, and verify.

## 3. Safety Constraints

* **Strict Key/Credential Separation**: Never hardcode API keys, secrets, private tokens, or passwords. Always use environmental variables, `.env` files (properly gitignored), or secure storage mechanisms (`expo-secure-store`, Keychain, keystore).
* **Verify Destructive Operations**: Always double-check before executing any command that modifies or deletes files/directories outside the workspace or commits to main without checks.
* **No Side-Effects in PRs**: Do not mutate global configuration files or git settings without explicit instruction.

## 4. Component Design (React Native)

* **Self-Contained Dependencies**: If a component depends on data or logic (e.g. a hook, store, or context) that the parent does not need for its own rendering, consume that dependency directly inside the component instead of threading it through props. Prefer `useUserSession()` inside `HomeHeader` over `<HomeHeader displayName={...} onSignOut={...} />`.

## 5. Decision-Making Principles

* **Read Before Write**: Always read existing implementations, surrounding tests, and package configurations before editing files.
* **Self-Verification Loop**: After making changes, run the project's linter, tests, and builds to verify stability. Do not rely on assumptions.
* **Trade-Off Consciousness**: When multiple architectural paths exist, choose the repository's default style, explain the trade-offs, and proceed with the cleanest implementation.
