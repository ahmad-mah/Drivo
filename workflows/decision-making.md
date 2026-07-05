# Decision Making Workflow

## Purpose

Architecture and technology decisions are the most impactful choices engineers make — they're expensive to reverse and affect every future change. This workflow provides a structured process for making decisions that are well-reasoned, documented, and defensible. It prevents both analysis paralysis and shoot-from-the-hip choices.

---

## Workflow Overview

```
1. Frame → 2. Research → 3. Evaluate → 4. Decide → 5. Record → 6. Revisit
```

---

## Step 1: Frame the Decision

**Goal:** Clearly define what you're deciding and why it matters.

### Actions

1. **State the decision as a question**
   ```
   # VAGUE — not a decision
   "We need to figure out the architecture"

   # CLEAR — actionable decision
   "How should we structure the data access layer for the order feature?"
   "Should we use a synchronous or asynchronous communication pattern
    between the order and payment modules?"
   ```

2. **Identify the constraints**
   - Time: When must this be decided by?
   - Resources: What can we afford in development and operations?
   - Compatibility: What must this work with?
   - Team: What does the team know how to maintain?

3. **Assess reversibility**
   | Reversibility | Decision Type        | Example                                  | Approach         |
   | ------------- | -------------------- | ---------------------------------------- | ---------------- |
   | Easy          | One-way door (NOT)   | Variable naming convention               | Decide quickly   |
   | Moderate      | Switchable           | Which logging library to use             | Research briefly |
   | Hard          | Two-way door (YES)   | Database technology, API contract         | Research deeply  |
   | Irreversible  | Permanent            | Public API published to external clients | Maximum rigor    |

4. **Define evaluation criteria** — what "good" looks like for this decision

### Exit Criteria
- [ ] Decision is stated as a clear question
- [ ] Constraints are listed
- [ ] Reversibility is assessed
- [ ] Evaluation criteria are defined

---

## Step 2: Research Options

**Goal:** Identify the viable approaches without evaluating them yet.

### Actions

1. **List at least 3 options** (including "do nothing" or "keep current approach")
   - Option A: [description]
   - Option B: [description]
   - Option C: Do nothing / keep current

2. **For each option, gather facts:**
   - How does it work?
   - Who else uses it successfully?
   - What are the known trade-offs?
   - What's the learning curve?
   - What's the maintenance cost?

3. **Time-box the research**
   | Decision Reversibility | Research Time Budget |
   | ---------------------- | -------------------- |
   | Easy to reverse        | 30 minutes           |
   | Moderate               | 2-4 hours            |
   | Hard to reverse        | 1-2 days             |
   | Irreversible           | 1 week               |

### Research Rules
- **MUST:** Consider "do nothing" as a valid option
- **MUST:** Include at least one option the team hasn't used before (avoid golden hammer)
- **MUST NOT:** Exceed the time budget — decide with available information
- **SHOULD:** Talk to someone who has experience with each option

### Exit Criteria
- [ ] At least 3 options identified
- [ ] Facts gathered for each (not opinions)
- [ ] Time budget respected

---

## Step 3: Evaluate Options

**Goal:** Compare options objectively against the defined criteria.

### Evaluation Matrix

Create a matrix scoring each option against your criteria:

```
| Criteria              | Weight | Option A | Option B | Option C (status quo) |
| --------------------- | ------ | -------- | -------- | --------------------- |
| Simplicity            | 5      | 4 (20)   | 2 (10)   | 5 (25)                |
| Team familiarity      | 4      | 3 (12)   | 1 (4)    | 5 (20)                |
| Scalability           | 3      | 5 (15)   | 5 (15)   | 2 (6)                 |
| Maintenance cost      | 4      | 3 (12)   | 2 (8)    | 4 (16)                |
| Testing ease          | 3      | 4 (12)   | 3 (9)    | 3 (9)                 |
| ────────────────────  | ────   | ──────── | ──────── | ─────────────────     |
| **Weighted Total**    |        | **71**   | **46**   | **76**                |
```

### Standard Evaluation Criteria

These criteria should be considered for every technical decision:

| Criteria                | What to Assess                                              |
| ----------------------- | ----------------------------------------------------------- |
| **Simplicity**          | How easy is this to understand and implement?               |
| **Team capability**     | Can the current team build and maintain this?               |
| **Scalability**         | Will this handle 10x growth without redesign?               |
| **Maintenance cost**    | What's the ongoing effort to keep this working?             |
| **Testing ease**        | How easy is it to test this approach?                       |
| **Reversibility**       | How hard is it to switch away if it's wrong?                |
| **Time to implement**   | How long until this is production-ready?                    |
| **Community/support**   | Is help available when you get stuck?                       |

### Bias Checks

Before finalizing your evaluation, check for these biases:

| Bias                    | Description                                        | Mitigation                                |
| ----------------------- | -------------------------------------------------- | ----------------------------------------- |
| **Familiarity bias**    | Preferring what you already know                   | Explicitly score unfamiliar options fairly|
| **Novelty bias**        | Preferring shiny new things                        | Weight maintenance cost and team skills   |
| **Sunk cost fallacy**   | Sticking with current approach because of past investment | Evaluate on future value, not past cost |
| **Authority bias**      | Choosing what a famous person/company uses         | Your context is different — evaluate locally |
| **Complexity bias**     | Assuming complex solutions are better              | Simple is almost always better            |

### Exit Criteria
- [ ] All options scored against criteria
- [ ] Scores are based on facts, not feelings
- [ ] Bias check completed
- [ ] A clear leading option has emerged (or a small set of finalists)

---

## Step 4: Decide

**Goal:** Make the decision and commit to it.

### Decision Rules

1. **If one option clearly wins** → Choose it. Don't second-guess.
2. **If two options are close** → Choose the simpler one. In a tie, simplicity wins.
3. **If the decision is easily reversible** → Choose the option that's fastest to implement. You can switch later.
4. **If the decision is hard to reverse** → Choose the option with the least downside risk (not the most upside potential).
5. **If you're stuck** → Time-box 1 more hour. If still stuck, choose the simplest option and move forward. No decision is worse than a suboptimal decision.

### The Decision Razor

> **When in doubt, choose the option that is:**
> 1. Simplest to understand
> 2. Easiest to change later
> 3. Most boring (proven, well-known)

### Exit Criteria
- [ ] A decision is made
- [ ] The rationale is clear
- [ ] Disagreements are resolved (or recorded as dissent)

---

## Step 5: Record the Decision

**Goal:** Document the decision so future developers understand why this approach was chosen.

### Architecture Decision Record (ADR) Format

```markdown
# ADR-[NNN]: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-NNN]

## Date
[YYYY-MM-DD]

## Context
[What is the situation? What problem are we solving?
 What constraints exist?]

## Decision
[What did we decide? Be specific.]

## Rationale
[Why this option over the alternatives?
 Reference the evaluation criteria and scores.]

## Alternatives Considered
### Option A: [Name]
- Pros: ...
- Cons: ...
- Why rejected: ...

### Option B: [Name]
- Pros: ...
- Cons: ...
- Why rejected: ...

## Consequences
### Positive
- [What improves]

### Negative
- [What gets harder]
- [What we're accepting as a trade-off]

## Review Date
[When should this decision be revisited? e.g., in 6 months,
 when user count exceeds 10K, when team grows beyond 5]
```

### Recording Rules
- **MUST:** Record all hard-to-reverse decisions
- **SHOULD:** Record moderate decisions
- **MAY:** Skip recording for easily reversible decisions
- **MUST:** Include alternatives and why they were rejected
- **MUST:** Include a review date

### Exit Criteria
- [ ] ADR is written and stored in the project
- [ ] Alternatives and rationale are documented
- [ ] Review date is set

---

## Step 6: Revisit When Conditions Change

**Goal:** Ensure decisions remain valid as context evolves.

### When to Revisit

- The review date has arrived
- A key constraint has changed (team size, scale, requirements)
- The decision is causing repeated pain
- New options have become available that weren't before

### How to Revisit

1. Re-read the original ADR
2. Check if the context/constraints have changed
3. If they have, re-run the evaluation with current information
4. If the decision would be different, create a new ADR that supersedes the old one

### Revisiting Rules
- **MUST NOT:** Revisit without new information. "I just don't like it" is not a reason to revisit.
- **MUST:** Update the old ADR's status to "Superseded by ADR-NNN" if a new decision is made.
- **SHOULD:** Keep old ADRs for historical context — never delete them.

---

## Quick Reference: Decision Types

```
┌─────────────────────────────────────────────────────────┐
│ TRIVIAL (Naming, formatting, minor style)               │
│ → Decide in < 5 minutes. Don't write an ADR.            │
│                                                          │
│ SMALL (Library choice, local pattern)                    │
│ → 30 min research. Brief note in commit message.         │
│                                                          │
│ MEDIUM (Module design, data access pattern)              │
│ → 2-4 hours research. Write a short ADR.                 │
│                                                          │
│ LARGE (Architecture, database, API contracts)            │
│ → 1-2 days research. Full ADR with evaluation matrix.    │
│                                                          │
│ CRITICAL (Public API, core platform choice)              │
│ → 1 week research. Full ADR, team review, stakeholder    │
│   alignment.                                             │
└─────────────────────────────────────────────────────────┘
```

---

## Anti-Patterns

### 1. Analysis Paralysis
Researching endlessly instead of deciding.
**Fix:** Time-box research. Set a deadline for the decision. At the deadline, choose the best option available.

### 2. HiPPO (Highest Paid Person's Opinion)
The most senior person decides without evaluation.
**Fix:** Use the evaluation matrix. Rank decides, not role.

### 3. Resume-Driven Decisions
Choosing technologies to learn something new, not to solve the problem.
**Fix:** Weight "team capability" and "maintenance cost" heavily in evaluation.

### 4. Undocumented Decisions
Making important decisions in conversations that aren't recorded.
**Fix:** Write an ADR for any decision that would confuse a future developer.

### 5. Revisiting Without New Information
Reopening settled decisions because someone disagrees.
**Fix:** A decision can only be revisited when new constraints or information emerge.

---

## Acceptance Criteria

The decision-making process is acceptable when:

1. Every hard-to-reverse decision has a written ADR
2. ADRs include alternatives considered and why they were rejected
3. Decisions are made within the time budget
4. The team can explain why any architectural choice was made by reading the ADR
5. Old ADRs are maintained and linked to superseding decisions when context changes
