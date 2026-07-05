# Code Review Standards

## Purpose

Code review is the last quality gate before code enters the codebase. This document defines what reviewers must check, how to provide feedback, and what constitutes a blocking versus advisory comment. The goal is consistent, objective, constructive reviews that improve code quality without becoming bottlenecks.

---

## Review Priorities

Review in this order. A higher-priority issue blocks a lower-priority improvement.

| Priority | Category           | Description                                    | Blocking? |
| -------- | ------------------ | ---------------------------------------------- | --------- |
| 1        | **Correctness**    | Does it work? Are edge cases handled?          | Yes       |
| 2        | **Security**       | Are there vulnerabilities? Data leaks?         | Yes       |
| 3        | **Architecture**   | Are boundaries respected? Dependencies correct?| Yes       |
| 4        | **Readability**    | Can someone else understand this easily?       | Usually   |
| 5        | **Performance**    | Are there obvious inefficiencies?              | Sometimes |
| 6        | **Style**          | Formatting, naming preferences                 | No        |

**Rule:** Never block a review solely on style. Automate style enforcement with formatters and linters.

---

## What to Check

### Correctness
- [ ] Does the code handle the happy path correctly?
- [ ] Are edge cases handled (empty input, null, max values, concurrent access)?
- [ ] Are error paths handled, not just caught and swallowed?
- [ ] Does it match the requirements/specification?
- [ ] Do tests cover the important behaviors?

### Security
- [ ] Is user input validated and sanitized at boundaries?
- [ ] Are secrets and credentials kept out of the code?
- [ ] Is authentication/authorization checked where needed?
- [ ] Are there SQL injection, XSS, or similar vulnerabilities?
- [ ] Is sensitive data logged or exposed in error messages?

### Architecture
- [ ] Does it follow the dependency rule (inward dependencies)?
- [ ] Are layer boundaries respected?
- [ ] Does it belong in this module/feature?
- [ ] Are new dependencies justified?
- [ ] Will this be maintainable as the codebase grows?

### Readability
- [ ] Can you understand each function without reading its implementation?
- [ ] Are names descriptive and consistent?
- [ ] Is the code self-documenting or are comments explaining non-obvious decisions?
- [ ] Is the complexity appropriate (not over-engineered)?
- [ ] Could a developer unfamiliar with this code modify it confidently?

### Testing
- [ ] Are there tests for the new behavior?
- [ ] Do tests verify behavior, not implementation?
- [ ] Are edge cases and error paths tested?
- [ ] Do tests have descriptive names?
- [ ] Can the tests run independently and in any order?

---

## How to Give Feedback

### Feedback Format

Prefix each comment to indicate its nature:

| Prefix          | Meaning                                         | Example                                       |
| --------------- | ----------------------------------------------- | --------------------------------------------- |
| `[blocking]`    | Must be fixed before merge                      | `[blocking] This doesn't handle null input`   |
| `[suggestion]`  | Recommended improvement, not required            | `[suggestion] Consider extracting this into a helper` |
| `[question]`    | Seeking understanding, not requesting change     | `[question] Why did you choose this approach?` |
| `[nit]`         | Minor style preference, never blocking           | `[nit] I'd name this 'user_count'`            |
| `[praise]`      | Calling out good work                            | `[praise] Clean separation of concerns here`  |

### Feedback Rules

1. **MUST:** Comment on code, not the person
   ```
   # BAD
   "You clearly don't understand how error handling works"

   # GOOD
   "[blocking] This catch block swallows the exception silently.
    Consider logging the error or propagating it."
   ```

2. **MUST:** Provide a reason, not just "change this"
   ```
   # BAD
   "This is wrong"

   # GOOD
   "[blocking] This query runs inside a loop, executing N+1 queries.
    Consider fetching all items in a single query."
   ```

3. **SHOULD:** Suggest an alternative when requesting changes
   ```
   # LESS HELPFUL
   "[suggestion] This function is too complex"

   # MORE HELPFUL
   "[suggestion] This function has 4 levels of nesting.
    Consider using guard clauses for the edge cases:
    if not valid: return early
    if not authorized: return error
    # main logic at base indent"
   ```

4. **SHOULD:** Acknowledge good work, not just problems
   ```
   "[praise] This error handling is thorough — good job covering
    the timeout and retry cases."
   ```

5. **MUST:** Respond within one business day to unblock the author.

---

## Review Decision Framework

### When to Approve

Approve when:
- All blocking issues are resolved
- Tests exist and pass
- The code is correct, secure, and maintainable
- Remaining suggestions are truly optional improvements

### When to Request Changes

Request changes when:
- There are correctness bugs
- Security vulnerabilities exist
- Architecture boundaries are violated
- Error handling is missing for critical paths
- No tests exist for new behavior

### When to Comment Without Blocking

Comment without blocking when:
- You see a minor readability improvement
- You'd name something differently
- You see a potential future issue (flag it, don't block)
- The approach works but a slightly better alternative exists

---

## Self-Review Checklist (Before Requesting Review)

Before asking someone to review your code, verify:

- [ ] I've read the diff myself as if I were the reviewer
- [ ] All tests pass
- [ ] No debugging artifacts remain (console.log, print statements, etc.)
- [ ] No commented-out code
- [ ] The commit message describes the change clearly
- [ ] The change is small enough to review in one sitting (< 400 lines preferred)
- [ ] Large changes are split into smaller, reviewable commits

---

## Anti-Patterns

### 1. Rubber-Stamping
Approving without actually reading the code.
**Fix:** Every approval must indicate what was reviewed and any notable observations.

### 2. Gatekeeping
Blocking for personal style preferences or theoretical concerns.
**Fix:** Only block for correctness, security, and architecture violations.

### 3. Bike-Shedding
Spending 30 minutes debating variable names while ignoring a security vulnerability.
**Fix:** Follow the priority order. Resolve high-priority issues first.

### 4. Drive-By Commenting
Leaving dozens of comments without context or priority.
**Fix:** Prioritize comments. Use prefixes. Keep total comments reasonable (< 10 for a typical review).

### 5. Review as Redesign
Suggesting a complete rewrite in the review instead of during design.
**Fix:** Raise architectural concerns before implementation. Reviews refine, not redesign.

---

## Decision Rules

1. **Is this a blocking issue or a suggestion?** → Would you page someone at 2 AM if this went to production? If yes, blocking. If no, suggestion.
2. **Should I request changes or leave a suggestion?** → Is the code broken or vulnerable? Request changes. Is it just not how you'd write it? Suggestion.
3. **Should this be discussed in the review or in a meeting?** → If it's about this specific code, review. If it's about architecture or team standards, take it to a meeting.
4. **Is this review too large?** → Can you review it in 30 minutes? If not, ask the author to split it.
5. **Am I debating style or substance?** → If style, automate it. If substance, discuss it.

---

## Quality Checklist

- [ ] All feedback uses priority prefixes ([blocking], [suggestion], etc.)
- [ ] Blocking comments include a reason and suggested fix
- [ ] Style issues are automated, not manually reviewed
- [ ] Reviews are completed within one business day
- [ ] Reviews focus on correctness and architecture before style
- [ ] Positive feedback is included alongside improvements
- [ ] Large changes are requested to be split into smaller reviews
- [ ] Self-review is done before requesting a peer review
- [ ] No rubber-stamping — every approval includes a substantive statement
- [ ] Reviewers can articulate why each blocking comment matters

---

## Acceptance Criteria

The code review process is acceptable when:

1. No correctness or security issue has ever been caught in production that was present in a reviewed change
2. Average review turnaround is under one business day
3. Authors feel that reviews improve their code, not obstruct their work
4. Style debates never block a merge (they're automated or flagged as nits)
5. New team members can review effectively by following this document
