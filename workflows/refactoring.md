# Refactoring Workflow

## Purpose

Refactoring is the process of improving code structure without changing its behavior. This workflow ensures refactoring is safe, incremental, and purposeful — never a "big bang rewrite" that introduces bugs.

---

## Workflow Overview

```
1. Identify → 2. Ensure Safety → 3. Plan → 4. Execute → 5. Verify
```

---

## Step 1: Identify What to Refactor

**Goal:** Confirm that refactoring is needed and define the specific improvement.

### Code Smells That Signal Refactoring Need

| Smell                          | Symptom                                        | Likely Refactoring                        |
| ------------------------------ | ---------------------------------------------- | ----------------------------------------- |
| **Long function**              | > 30 lines, does multiple things               | Extract functions                         |
| **Large class**                | > 300 lines, too many responsibilities         | Extract classes                           |
| **Duplicated knowledge**       | Same business rule in multiple places          | Extract shared function/constant          |
| **Deep nesting**               | > 3 levels of indentation                      | Guard clauses, extract functions          |
| **Primitive obsession**        | Strings/ints used for domain concepts          | Introduce value types                     |
| **Feature envy**               | Function uses more data from another class     | Move function to the other class          |
| **Shotgun surgery**            | One change requires editing many files         | Consolidate related code                  |
| **Data clumps**                | Same group of parameters appear together       | Extract a parameter object                |
| **Long parameter list**        | > 4 parameters                                 | Introduce parameter/config object         |
| **Switch statements**          | Same switch on type in multiple places         | Replace with polymorphism                 |

### When NOT to Refactor

- **If it's not broken and not being modified.** Don't refactor code you're not otherwise working on.
- **If you don't have tests.** Refactoring without tests is rewriting and hoping.
- **If you're on a deadline.** Refactoring under pressure leads to cutting corners.
- **If the improvement is trivial.** Renaming one variable isn't worth a commit.

### Exit Criteria
- [ ] The specific smell is identified
- [ ] The target refactoring is named (e.g., "Extract Method", "Move to Class")
- [ ] The expected improvement is clear ("reduces function from 80 to 15 lines")
- [ ] The refactoring is worth the effort

---

## Step 2: Ensure Safety Net

**Goal:** Confirm that existing tests will catch any behavioral changes.

### Actions

1. **Run existing tests** — do they all pass?
2. **Assess test coverage for the code being refactored**
   - Are the critical paths tested?
   - Are edge cases covered?
3. **Write additional tests if coverage is insufficient**
   - These tests capture current behavior (characterization tests)
   - They don't need to test correct behavior — just current behavior
4. **Commit the tests before refactoring** — this proves they pass with the old code

### Safety Rules

- **MUST:** Never refactor code without tests covering the refactored area
- **MUST:** Commit tests separately from refactoring changes
- **MUST:** Tests pass before AND after each refactoring step

### Exit Criteria
- [ ] All existing tests pass
- [ ] Test coverage is sufficient for the area being refactored
- [ ] Additional characterization tests are written if needed
- [ ] Tests are committed separately

---

## Step 3: Plan the Refactoring

**Goal:** Break the refactoring into small, safe steps.

### The Golden Rule of Refactoring

> Each step MUST leave the code in a working state. If any step breaks things, revert that step immediately.

### Step Size Guide

| Refactoring Type           | Step Size                              | Example Steps                              |
| -------------------------- | -------------------------------------- | ------------------------------------------ |
| Rename                     | Single step                            | Rename variable → done                     |
| Extract function           | Single step                            | Select code → extract → verify             |
| Extract class              | 3-5 steps                              | Create class → move methods → update callers|
| Replace conditional        | Multiple steps                         | Create interface → implement each branch → replace switch |
| Move between modules       | Multiple steps                         | Copy → update imports → verify → delete old|

### Planning Rules
- Each step must be independently committable
- Each step must pass all tests
- Never change behavior and structure in the same step
- If a step gets complicated, it's too large — split it further

### Exit Criteria
- [ ] Refactoring is broken into small, safe steps
- [ ] Each step has a clear action and expected outcome
- [ ] No step combines behavior change with structure change

---

## Step 4: Execute the Refactoring

**Goal:** Apply each step, verifying between steps.

### The Refactoring Loop

```
For each step:
  1. Make ONE structural change
  2. Run ALL tests
  3. Tests pass? → Commit → Next step
  4. Tests fail? → Revert → Reassess
```

### Common Refactoring Moves

#### Extract Function
```
# Before
def process_order(order):
    # validate
    if not order.items:
        raise EmptyOrderError()
    if order.total < 0:
        raise InvalidTotalError()
    # calculate
    subtotal = sum(item.price for item in order.items)
    tax = subtotal * TAX_RATE
    total = subtotal + tax
    # save
    database.save(order, total)

# After — each concern is a named function
def process_order(order):
    validate_order(order)
    total = calculate_total(order)
    save_order(order, total)
```

#### Replace Conditional with Polymorphism
```
# Before
def calculate_area(shape):
    if shape.type == "circle":
        return pi * shape.radius ** 2
    elif shape.type == "rectangle":
        return shape.width * shape.height
    elif shape.type == "triangle":
        return 0.5 * shape.base * shape.height

# After — each shape knows how to calculate its area
class Circle:
    def area(self):
        return pi * self.radius ** 2

class Rectangle:
    def area(self):
        return self.width * self.height
```

#### Introduce Parameter Object
```
# Before
def search(query, page, page_size, sort_by, sort_order, filters):
    ...

# After
def search(request: SearchRequest):
    ...
```

### Execution Rules
- **MUST:** Run tests after every single change
- **MUST:** Revert immediately if tests fail — no debugging during refactoring
- **MUST:** Commit after each successful step (small commits)
- **MUST NOT:** Add features or fix bugs during refactoring
- **MUST NOT:** Change test expectations during refactoring (behavior is preserved)

### Exit Criteria
- [ ] All refactoring steps are applied
- [ ] All tests pass after every step
- [ ] Code structure is improved as planned
- [ ] No behavior has changed

---

## Step 5: Verify the Refactoring

**Goal:** Confirm the refactoring achieved its goal without side effects.

### Actions

1. **Run the full test suite** — everything should pass
2. **Compare behavior before and after** — outputs should be identical
3. **Review the diff** — does it clearly show structural improvement?
4. **Measure improvement** — is the code actually simpler/cleaner?
   - Shorter functions?
   - Fewer dependencies?
   - Better names?
   - Less nesting?
5. **Self-review** using `rules/code-review-standards.md`

### Verification Metrics

| Metric                    | Before       | After        | Improved? |
| ------------------------- | ------------ | ------------ | --------- |
| Longest function (lines)  | ___          | ___          | ___       |
| Max nesting depth         | ___          | ___          | ___       |
| Number of responsibilities| ___          | ___          | ___       |
| Test count                | ___          | ___          | ≥ same    |

### Exit Criteria
- [ ] All tests pass
- [ ] Behavior is unchanged
- [ ] Code is measurably improved
- [ ] Diff tells a clear story
- [ ] Ready for code review

---

## Anti-Patterns

### 1. Big Bang Refactor
Rewriting large sections of code all at once.
**Fix:** Small, incremental steps with tests between each step.

### 2. Refactoring Without Tests
"I'll be careful" is not a safety net.
**Fix:** Write characterization tests first. Then refactor.

### 3. Refactoring and Feature Development Together
Mixing behavior changes with structural changes makes it impossible to know what caused a bug.
**Fix:** Separate commits for refactoring and features. Never in the same commit.

### 4. Refactoring Code You're Not Working On
Improving code you stumbled upon but don't need to change.
**Fix:** File a ticket for the refactoring. Do it when you need to modify that code.

### 5. Perfection-Driven Refactoring
Refactoring until the code is "perfect" instead of "good enough."
**Fix:** Stop when the specific smell is eliminated. Perfect is the enemy of good.

---

## Decision Rules

1. **Should I refactor this now?** → Are you already modifying this code for another reason? If yes, refactor. If no, file a ticket.
2. **How much should I refactor?** → Fix the specific smell. Don't expand scope.
3. **Refactor or rewrite?** → If the code has tests and the structure is mostly sound, refactor. If it has no tests and is fundamentally broken, consider rewriting.
4. **Tests are failing during refactoring — what do I do?** → Revert the last step immediately. Don't debug. Reassess the approach.
5. **My refactoring is getting complicated — what do I do?** → The steps are too large. Revert, break into smaller steps.

---

## Acceptance Criteria

A refactoring is complete when:

1. All tests pass (same tests, no changes to expectations)
2. The identified code smell is eliminated
3. Each commit in the refactoring is independently buildable and testable
4. No behavior has changed
5. The code is measurably improved by at least one metric (length, complexity, coupling)
