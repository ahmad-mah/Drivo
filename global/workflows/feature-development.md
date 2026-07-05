# Feature Development Workflow

## Purpose

This workflow guides the end-to-end process of building a new feature — from understanding requirements through delivery. Following this process ensures features are well-designed, properly implemented, and thoroughly verified before reaching users.

---

## Workflow Overview

```
1. Understand → 2. Design → 3. Plan → 4. Implement → 5. Verify → 6. Deliver
```

---

## Step 1: Understand the Requirement

**Goal:** Know exactly what you're building and why before writing any code.

### Actions

1. **Read the requirement** and restate it in your own words
2. **Identify the user's problem** — what pain point does this feature solve?
3. **Define acceptance criteria** — how will we know this is done?
4. **Identify edge cases** — what happens with empty data, max limits, concurrent access?
5. **Identify dependencies** — does this feature depend on or affect other features?
6. **Clarify ambiguities** — if anything is unclear, ask now, not during implementation

### Exit Criteria
- [ ] You can explain the feature to someone in 2 sentences
- [ ] Acceptance criteria are written and agreed upon
- [ ] Edge cases are listed
- [ ] Dependencies are identified
- [ ] All ambiguities are resolved

### Common Mistakes
- Starting to code before understanding the full scope
- Assuming requirements instead of asking
- Ignoring edge cases until testing

---

## Step 2: Design the Solution

**Goal:** Choose the right approach before committing to implementation.

### Actions

1. **Identify where this feature lives** in the existing architecture
   - Which module/feature directory?
   - What layer(s) does it touch?
   - Reference: `rules/architecture-boundaries.md`

2. **Design the data model**
   - What entities and value objects are needed?
   - What state transitions exist?
   - Reference: `skills/data-modeling.md`

3. **Design the interfaces**
   - What public API does this feature expose?
   - What does it depend on?
   - Reference: `skills/api-design.md`

4. **Consider alternatives**
   - What are at least 2 approaches?
   - Why is the chosen approach better?
   - Document the decision if significant (see `workflows/decision-making.md`)

5. **Evaluate complexity**
   - Is this the simplest solution? (KISS)
   - Am I building anything speculative? (YAGNI)
   - Reference: `rules/complexity-management.md`

### Exit Criteria
- [ ] The feature's location in the architecture is clear
- [ ] Data model is sketched (entities, relationships, state transitions)
- [ ] Public API is defined (inputs, outputs, errors)
- [ ] At least one alternative was considered
- [ ] The solution passes the KISS/YAGNI check

### Common Mistakes
- Designing in too much detail (analysis paralysis)
- Not considering existing patterns in the codebase
- Over-engineering the first version

---

## Step 3: Plan the Implementation

**Goal:** Break the work into small, deliverable increments.

### Actions

1. **Decompose into tasks** — each task should be:
   - Independently testable
   - Completable in 1-4 hours
   - Deliverable on its own (working code, not broken intermediate state)

2. **Order by dependency** — build foundation before features
   ```
   Typical order:
   1. Data model / entities
   2. Repository / data access
   3. Business logic / service layer
   4. Presentation / API layer
   5. Integration and wiring
   ```

3. **Identify risks** — what might go wrong? What are you least sure about?
   - Tackle the riskiest part first (fail fast)

### Exit Criteria
- [ ] Work is broken into tasks of 1-4 hours each
- [ ] Tasks are ordered by dependency
- [ ] Each task has clear "done" criteria
- [ ] Riskiest work is scheduled first

### Common Mistakes
- Tasks too large (> 1 day each)
- Building the easy parts first, risky parts last
- Not defining "done" for each task

---

## Step 4: Implement

**Goal:** Write clean, tested code following established patterns.

### Actions

For each task:

1. **Write the test first** (or at least the test specification)
   - What behavior are you testing?
   - What are the inputs and expected outputs?
   - Reference: `skills/testing-strategy.md`

2. **Write the minimal code to pass the test**
   - Follow the rules in `rules/clean-code.md`
   - Follow naming conventions in `skills/naming-conventions.md`

3. **Refactor** — clean up while the context is fresh
   - Extract functions if anything is too long
   - Improve names if anything is unclear
   - Remove any duplication of knowledge (not just code)

4. **Self-review before committing**
   - Read the diff as if you were the reviewer
   - Check against `rules/code-review-standards.md` self-review checklist
   - Remove debug code, temporary comments, unused imports

5. **Commit with a meaningful message**
   ```
   # Format
   <type>: <short summary>

   <body explaining why, not what>

   # Examples
   feat: add order cancellation within 24 hours
   fix: handle null address in shipping calculation
   refactor: extract tax calculation into dedicated service
   ```

### Implementation Checklist Per Task
- [ ] Tests written for the new behavior
- [ ] Edge cases tested
- [ ] Error paths tested
- [ ] Code follows naming conventions
- [ ] Functions are small and focused (< 20 lines)
- [ ] No magic numbers or strings
- [ ] Dependencies are injected, not created
- [ ] Self-review completed
- [ ] Clean commit with descriptive message

### Common Mistakes
- Writing all the code then all the tests
- Giant commits covering multiple changes
- Skipping self-review
- Leaving TODO comments without ticket references

---

## Step 5: Verify

**Goal:** Confirm the feature works correctly, handles edge cases, and doesn't break existing functionality.

### Actions

1. **Run the full test suite** — nothing should be newly broken
2. **Test edge cases manually** — empty data, boundaries, invalid input
3. **Test the integration** — does it work with real dependencies (database, APIs)?
4. **Check for regressions** — does existing functionality still work?
5. **Review against acceptance criteria** — does the feature do what was specified?
6. **Performance sanity check** — is it acceptably fast? (No formal profiling unless concerned)

### Exit Criteria
- [ ] All tests pass (new and existing)
- [ ] All acceptance criteria are met
- [ ] Edge cases are verified
- [ ] No regressions in existing functionality
- [ ] Performance is acceptable

### Common Mistakes
- Only testing the happy path
- Not running the full test suite
- Declaring done before checking acceptance criteria

---

## Step 6: Deliver

**Goal:** Get the feature into the hands of users safely.

### Actions

1. **Request code review** — submit with:
   - Summary of what changed and why
   - Link to the requirement
   - Any areas you'd like specific feedback on

2. **Address review feedback**
   - Fix all blocking issues
   - Respond to all comments (even if just acknowledging)
   - Don't take feedback personally — it's about the code

3. **Merge when approved**
   - Ensure CI passes
   - Resolve merge conflicts cleanly

4. **Monitor after deployment**
   - Watch for errors in the first hour
   - Verify the feature works in the deployed environment
   - Be ready to revert if something goes wrong

### Exit Criteria
- [ ] Code review is approved
- [ ] All CI checks pass
- [ ] Merged to main branch
- [ ] Deployed successfully
- [ ] No new errors after deployment

---

## Quick Reference: Feature Development Steps

```
┌─────────────────────────────────────────────────┐
│ 1. UNDERSTAND                                   │
│    → Restate requirement, define acceptance      │
│    → List edge cases and dependencies            │
│                                                  │
│ 2. DESIGN                                       │
│    → Choose where it lives in architecture       │
│    → Design data model and interfaces            │
│    → Verify KISS/YAGNI                           │
│                                                  │
│ 3. PLAN                                         │
│    → Break into 1-4 hour tasks                   │
│    → Order by dependency, risk first             │
│                                                  │
│ 4. IMPLEMENT (per task)                          │
│    → Test → Code → Refactor → Self-review → Commit│
│                                                  │
│ 5. VERIFY                                       │
│    → Full test suite, edge cases, regressions    │
│    → Check acceptance criteria                   │
│                                                  │
│ 6. DELIVER                                      │
│    → Code review → Address feedback → Merge      │
│    → Deploy → Monitor                            │
└─────────────────────────────────────────────────┘
```

---

## Decision Rules

1. **Not sure about the requirement?** → Stop and ask. Never guess.
2. **Not sure which design to choose?** → Follow `workflows/decision-making.md`.
3. **Task taking longer than expected?** → Reassess scope. Is the task too large? Is there an unknown risk?
4. **Tests are hard to write?** → The design might be wrong. Consider redesigning before forcing tests.
5. **Review feedback seems wrong?** → Discuss it. Provide your reasoning. If it's a style preference, accept it.

---

## Acceptance Criteria

The feature development workflow is executed correctly when:

1. The feature meets all stated acceptance criteria
2. The code is reviewed and approved by at least one other engineer
3. The test suite passes completely (no regressions)
4. The change can be understood by reading the code without asking the author
5. The commit history tells a clear story of how the feature was built
