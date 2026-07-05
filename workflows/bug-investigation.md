# Bug Investigation Workflow

## Purpose

This workflow provides a systematic process for investigating and fixing bugs. The goal is to move from symptom to root cause to verified fix efficiently, without introducing new bugs or applying band-aid fixes that mask the real problem.

---

## Workflow Overview

```
1. Reproduce → 2. Isolate → 3. Diagnose → 4. Fix → 5. Verify → 6. Prevent
```

---

## Step 1: Reproduce the Bug

**Goal:** Confirm the bug exists and create a reliable way to trigger it.

### Actions

1. **Read the bug report carefully** — note the exact symptoms, not just the title
2. **Reproduce in a controlled environment** — can you trigger the bug consistently?
3. **Identify the reproduction steps** — minimal sequence of actions that causes the bug
4. **Note the environment** — what configuration, data, or state is required?
5. **Write a failing test** — if possible, capture the bug as a test case before fixing

### Reproduction Checklist
- What is the exact input or user action?
- What is the expected behavior?
- What is the actual behavior?
- Is it reproducible 100% of the time, or intermittent?
- Does it happen in all environments or only specific ones?

### Exit Criteria
- [ ] Bug is reproducible on demand (or pattern is identified for intermittent bugs)
- [ ] Reproduction steps are documented
- [ ] A failing test captures the bug (when feasible)

### If You Can't Reproduce
- Check if the bug depends on specific data, timing, or configuration
- Check if it's environment-specific (production vs. development)
- Add logging/observability to capture more information on next occurrence
- **Do NOT guess at the fix.** A fix without reproduction is a gamble.

---

## Step 2: Isolate the Problem

**Goal:** Narrow down where in the codebase the bug originates.

### Actions

1. **Trace the execution path** — follow the code from input to output
2. **Identify the last known good state** — at which point does the data/behavior become wrong?
3. **Binary search through the code path**
   - Insert checkpoints (log statements, breakpoints, assertions)
   - Is the data correct at the midpoint? If yes, bug is after. If no, bug is before.
   - Repeat until you find the exact location

4. **Check recent changes** — was this working before? What changed?
   - Review recent commits touching this area
   - Check dependency updates
   - Check configuration changes

### Isolation Techniques

| Technique                    | When to Use                          | How                                        |
| ---------------------------- | ------------------------------------ | ------------------------------------------ |
| **Binary search**            | Long code paths                      | Check halfway point, narrow the half        |
| **Diff analysis**            | "It was working yesterday"           | Review commits since last working state     |
| **Input reduction**          | Complex input triggers the bug       | Simplify input until you find minimal case  |
| **Component substitution**   | Unclear which component is at fault  | Replace components with known-good versions |
| **Logging**                  | Can't use a debugger                 | Add temporary structured logging           |

### Exit Criteria
- [ ] The specific function/module where the bug occurs is identified
- [ ] The root cause is understood (not just the symptom)
- [ ] You can explain WHY the bug happens, not just WHERE

---

## Step 3: Diagnose the Root Cause

**Goal:** Understand why the bug exists, not just what's broken.

### The Five Whys

Ask "why" repeatedly until you reach the root cause:

```
Bug: Order total is incorrect.
Why? Tax is calculated on the discounted price.
Why? The discount is applied before tax.
Why? The function applies transformations in the wrong order.
Why? The function does both discount and tax in one step with no clear sequence.
Why? No explicit pipeline defines the calculation order.

Root cause: No enforced ordering of price transformations.
Fix: Create an explicit price calculation pipeline with defined step order.
```

### Diagnosis Categories

| Category                | Symptoms                              | Typical Root Cause                         |
| ----------------------- | ------------------------------------- | ------------------------------------------ |
| **Logic error**         | Wrong output for given input          | Incorrect conditional, wrong formula        |
| **State corruption**    | Intermittent, hard to reproduce       | Shared mutable state, race condition        |
| **Missing edge case**   | Works usually, fails for specific input| Unhandled null, empty, boundary value      |
| **Integration mismatch**| Works alone, fails with real dependency| Contract violation, format mismatch         |
| **Configuration error** | Works in dev, fails in production     | Missing or incorrect config value           |

### Exit Criteria
- [ ] Root cause is identified and can be stated in one sentence
- [ ] The diagnosis category is identified
- [ ] You understand why existing tests didn't catch this

---

## Step 4: Fix the Bug

**Goal:** Fix the root cause with minimal, targeted changes.

### Actions

1. **Fix the root cause, not the symptom**
   ```
   # SYMPTOM FIX (bad)
   if total < 0:
       total = 0  # Hide the negative total

   # ROOT CAUSE FIX (good)
   # Fix the calculation order so total is never negative
   total = apply_discount(apply_tax(subtotal))
   ```

2. **Make the minimal change** — don't refactor or improve other things in the same change
   - Bug fixes should be laser-focused
   - Refactoring goes in a separate commit

3. **Ensure the failing test now passes**
   - The test you wrote in Step 1 should go green
   - If you couldn't write a test before, write one now

4. **Add regression tests for similar cases**
   - What variations of this bug could exist?
   - Test those too

5. **Review for unintended side effects**
   - Could this fix break something else?
   - Run the full test suite

### Fix Quality Rules
- **MUST** fix the root cause, not the symptom
- **MUST** include a test that would have caught this bug
- **MUST** run the full test suite before committing
- **SHOULD** keep the fix in a separate commit from any refactoring
- **SHOULD** include a commit message that explains what caused the bug and how the fix addresses it

### Exit Criteria
- [ ] The root cause is fixed (not just the symptom)
- [ ] A test exists that would catch this bug if it returned
- [ ] The fix is minimal and focused
- [ ] The full test suite passes
- [ ] No unintended side effects

---

## Step 5: Verify the Fix

**Goal:** Confirm the bug is truly fixed and nothing else is broken.

### Actions

1. **Verify the original reproduction steps** — does the bug still occur? It shouldn't.
2. **Run the full test suite** — any regressions?
3. **Test related functionality** — what else might be affected by this code path?
4. **Test edge cases around the fix** — similar inputs, boundary values
5. **Verify in the environment where it was reported** (if different from development)

### Exit Criteria
- [ ] Original bug no longer reproduces
- [ ] Full test suite passes
- [ ] Related functionality still works
- [ ] Fix verified in the reporting environment

---

## Step 6: Prevent Recurrence

**Goal:** Make it harder for this class of bug to happen again.

### Actions

1. **Add the regression test to the permanent test suite**
2. **Consider structural prevention**
   - Can the type system prevent this? (e.g., use an enum instead of a string)
   - Can the API design prevent this? (e.g., make illegal states unrepresentable)
   - Can a linter or static analysis catch this?

3. **Update documentation if a non-obvious gotcha was involved**
   - Add a comment explaining why the code is written this way
   - Update the relevant architecture or design docs

4. **Share the learning**
   - Is this a class of bug the team should know about?
   - Could this happen in similar code elsewhere?

### Prevention Checklist
- [ ] Regression test is permanent (not temporary or skipped)
- [ ] Structural prevention considered (types, API design, linting)
- [ ] Similar code elsewhere is checked for the same bug
- [ ] Documentation updated if needed
- [ ] Team notified if it's a systemic issue

---

## Quick Reference: Bug Investigation Steps

```
┌─────────────────────────────────────────────────┐
│ 1. REPRODUCE                                    │
│    → Confirm the bug, create reliable repro      │
│    → Write a failing test                        │
│                                                  │
│ 2. ISOLATE                                      │
│    → Binary search the code path                 │
│    → Find the exact location                     │
│                                                  │
│ 3. DIAGNOSE                                     │
│    → Five Whys to root cause                     │
│    → Identify the category                       │
│                                                  │
│ 4. FIX                                          │
│    → Fix root cause, not symptom                 │
│    → Minimal, focused change                     │
│    → Test passes                                 │
│                                                  │
│ 5. VERIFY                                       │
│    → Original bug is gone                        │
│    → Nothing else is broken                      │
│                                                  │
│ 6. PREVENT                                      │
│    → Regression test permanent                   │
│    → Structural prevention if possible           │
│    → Check for same bug elsewhere                │
└─────────────────────────────────────────────────┘
```

---

## Decision Rules

1. **Can't reproduce the bug?** → Add logging and wait for the next occurrence. Don't guess at a fix.
2. **Quick fix or proper fix?** → Always proper fix. "Quick fixes" become permanent technical debt.
3. **Multiple potential causes?** → Test each hypothesis individually. Don't change multiple things at once.
4. **Fix requires a large refactor?** → Fix the bug minimally first (ship it), then refactor in a separate change.
5. **Same bug reported by multiple users?** → Prioritize. The more users affected, the more urgent.

---

## Acceptance Criteria

A bug fix is complete when:

1. The bug no longer reproduces using the original steps
2. A test exists that catches this specific bug
3. The full test suite passes with no regressions
4. The fix addresses the root cause, not just the symptom
5. Structural prevention has been considered and applied where possible
