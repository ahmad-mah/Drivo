# Technical Debt Management

## Purpose

Technical debt is the accumulated cost of shortcuts, deferred maintenance, and design compromises that make future changes harder. Like financial debt, it accrues interest — the longer it persists, the more it costs. This workflow provides a systematic approach to identifying, prioritizing, and resolving technical debt.

---

## Workflow Overview

```
1. Identify → 2. Categorize → 3. Prioritize → 4. Plan → 5. Execute → 6. Track
```

---

## Step 1: Identify Technical Debt

**Goal:** Make invisible debt visible.

### Sources of Technical Debt

| Source                        | How to Detect                                    | Examples                                   |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------ |
| **Deliberate shortcuts**     | TODO/HACK/FIXME comments                          | "Quick fix for launch, clean up later"     |
| **Outdated dependencies**    | Dependency audit tools                            | Libraries 2+ major versions behind         |
| **Missing tests**            | Coverage reports, areas with frequent bugs        | Critical paths with no test coverage       |
| **Copy-paste code**          | Duplication detection, code review observations   | Same logic in 5 places                     |
| **Unclear naming**           | New developers ask "what does this do?"           | Variables named `data`, `temp`, `x`        |
| **Dead code**                | Unreachable code, unused exports                  | Features removed but code remains          |
| **Overcomplicated code**     | Takes > 15 minutes to understand a module         | 10 layers of abstraction for simple CRUD   |
| **Missing documentation**    | Tribal knowledge, bus factor = 1                  | No README, no architecture docs            |
| **Architectural violations** | Import analysis, dependency checks                | UI layer importing database directly       |

### Detection Practices

1. **During code review** — note debt as you encounter it, don't just approve around it
2. **During bug fixes** — debt is often the root cause of recurring bugs
3. **During onboarding** — new developers find confusing code that the team has become blind to
4. **During feature work** — existing code that makes new features harder than expected
5. **Periodic audit** — scheduled quarterly review of codebase health

### Exit Criteria
- [ ] Debt items are documented (location, description, impact)
- [ ] Each item has a clear description of what's wrong and what "fixed" looks like

---

## Step 2: Categorize the Debt

**Goal:** Understand the nature of each debt item to determine the right response.

### Debt Categories

| Category              | Description                                     | Interest Rate | Typical Action         |
| --------------------- | ----------------------------------------------- | ------------- | ---------------------- |
| **Reckless/Deliberate** | "We know it's wrong, we shipped it anyway"    | High          | Fix soon               |
| **Prudent/Deliberate**  | "Ship now, improve later — we accept the cost"| Medium        | Schedule fix           |
| **Reckless/Inadvertent**| "We didn't know better at the time"           | High          | Fix when touching area |
| **Prudent/Inadvertent** | "Now we know a better way to do this"         | Low           | Fix when beneficial    |

### Impact Assessment

For each debt item, assess:

```
Impact Score = Frequency of Encounter × Cost per Encounter

Frequency: How often do developers touch or work around this code?
  5 = Daily
  3 = Weekly
  1 = Rarely

Cost: How much time is wasted or risk is introduced per encounter?
  5 = Hours wasted, high bug risk
  3 = Significant friction, moderate risk
  1 = Minor annoyance, low risk

Impact Score:
  20-25 = Critical (fix immediately)
  10-19 = High (fix this quarter)
  5-9   = Medium (fix when working nearby)
  1-4   = Low (fix opportunistically)
```

### Exit Criteria
- [ ] Each debt item is categorized
- [ ] Impact score is assigned
- [ ] Fix effort is estimated (hours/days)

---

## Step 3: Prioritize

**Goal:** Work on the debt that provides the highest return on investment.

### Prioritization Matrix

```
                    Low Effort          High Effort
                ┌───────────────────┬───────────────────┐
  High Impact   │  DO FIRST         │  PLAN & SCHEDULE  │
                │  Quick wins with  │  Significant      │
                │  high payoff      │  improvement,     │
                │                   │  needs time        │
                ├───────────────────┼───────────────────┤
  Low Impact    │  DO WHEN NEARBY   │  DON'T DO         │
                │  Fix while        │  Not worth the    │
                │  working on       │  investment        │
                │  related code     │                    │
                └───────────────────┴───────────────────┘
```

### Prioritization Rules

1. **High impact, low effort** → Do immediately (within current sprint)
2. **High impact, high effort** → Schedule as a dedicated task with a deadline
3. **Low impact, low effort** → Fix when you're already modifying that code (Boy Scout Rule)
4. **Low impact, high effort** → Don't do it. Accept this debt.

### Exit Criteria
- [ ] Debt items are sorted by priority
- [ ] Top items have target dates
- [ ] Bottom items are accepted as permanent (until impact changes)

---

## Step 4: Plan the Resolution

**Goal:** Turn high-priority debt items into actionable work.

### Actions

1. **Define "done"** — what does the code look like after the debt is resolved?
2. **Scope the change** — what files/modules are affected?
3. **Identify risks** — could fixing this break something?
4. **Ensure tests exist** — you need a safety net before changing things
5. **Break into tasks** — no debt resolution task should exceed 1 day of effort
6. **Decide on strategy:**

### Resolution Strategies

| Strategy                  | When to Use                                       | Approach                                   |
| ------------------------- | ------------------------------------------------- | ------------------------------------------ |
| **Boy Scout Rule**        | Low-effort improvements                           | Make each touched file a little better     |
| **Focused sprint**        | Related debt in one area                          | Dedicate a sprint to paying down debt      |
| **Strangler pattern**     | Large legacy code needing gradual replacement     | Build new alongside old, migrate gradually |
| **Rewrite**               | Code is unfixable (rare, high risk)               | Only with full test coverage and clear scope|

### Exit Criteria
- [ ] Resolution tasks are defined with clear "done" criteria
- [ ] Tasks are sized (< 1 day each)
- [ ] Test coverage is confirmed or planned
- [ ] Strategy is selected

---

## Step 5: Execute

**Goal:** Resolve the debt without introducing new debt or bugs.

### Execution Rules

1. **Follow the refactoring workflow** — `workflows/refactoring.md`
2. **Keep debt fixes separate from feature work** — separate commits
3. **Don't expand scope** — fix only what was planned
4. **Run tests continuously** — no regressions
5. **Apply the Boy Scout Rule daily** — leave every file you touch a little cleaner

### The Boy Scout Rule in Practice

```
# When you open a file to fix a bug or add a feature:

Before your change:
  - Is there a dead import? Remove it.
  - Is there a misleading variable name? Rename it.
  - Is there a TODO that takes 2 minutes? Do it.
  - Is there a magic number? Name it.

After your change:
  - Commit the cleanup separately from your feature/fix
  - The file is now slightly cleaner than when you found it
```

### Exit Criteria
- [ ] Debt item is resolved
- [ ] All tests pass
- [ ] No new debt introduced
- [ ] Changes are committed separately from feature work

---

## Step 6: Track Progress

**Goal:** Know whether debt is increasing or decreasing over time.

### Tracking Metrics

| Metric                          | How to Measure                          | Target Trend    |
| ------------------------------- | --------------------------------------- | --------------- |
| Open debt items                 | Count of documented debt items          | Decreasing      |
| TODO/FIXME count                | Grep count in codebase                  | Stable or down  |
| Average fix time for bugs       | Time from report to fix                 | Decreasing      |
| Time to onboard new developer   | Days until first productive contribution| Decreasing      |
| "Pain" reported by team         | Qualitative feedback                    | Decreasing      |
| Dependency freshness            | Average age of dependencies             | Current         |

### Tracking Practices
- Review debt inventory quarterly
- Remove resolved items
- Reassess priorities (impact may have changed)
- Celebrate debt payoff — it's real engineering work

---

## Anti-Patterns

### 1. Ignoring Debt Until It's a Crisis
Accumulating debt until development slows to a crawl.
**Fix:** Dedicate 10-20% of each development cycle to debt reduction.

### 2. The Big Rewrite
"Let's rewrite everything from scratch — it'll be better."
**Fix:** Incremental improvement. Rewrites take longer than expected and often reintroduce old bugs.

### 3. Debt Shaming
Blaming individuals for creating technical debt.
**Fix:** Debt is a team responsibility. Focus on the code, not the person who wrote it.

### 4. Perfection as Debt Resolution
Using debt reduction as an excuse to gold-plate code.
**Fix:** Fix the identified problem. Stop. Move on.

### 5. Only New Code Gets Attention
Building new features on top of rotting foundations.
**Fix:** Balance new features with foundation maintenance.

---

## Decision Rules

1. **Should I fix this debt now?** → Is it high impact AND low effort? Or are you already in that code? If yes, fix it. Otherwise, document and prioritize.
2. **Refactor or rewrite?** → If the code has tests and is partially sound, refactor. Rewrite only as a last resort with full test coverage.
3. **How much time should we spend on debt?** → 10-20% of each cycle is sustainable. Less leads to debt accumulation. More starves feature development.
4. **Should we take on new debt for a deadline?** → Only if the debt is documented, categorized, and scheduled for resolution. Undocumented shortcuts are the dangerous kind.
5. **Is this debt or just "old code"?** → Does it slow down current work? If yes, it's debt. If it works fine and nobody touches it, it's just old code.

---

## Acceptance Criteria

Technical debt management is acceptable when:

1. All known debt items are documented with impact scores
2. High-impact items have resolution plans with target dates
3. Debt is trending downward (or stable) quarter over quarter
4. The team spends 10-20% of each cycle on debt reduction
5. New debt is always documented and categorized, never ignored
