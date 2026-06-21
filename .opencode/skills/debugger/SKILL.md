---
name: debugger
description: Use when investigating, analyzing, or fixing bugs, crashes, exceptions, or test failures across mobile and backend environments.
---

# Skill: Debugger

This skill provides a systematic approach to identifying, isolating, and solving bugs or performance anomalies.

## Rules
1. **Never guess the fix**: Always reproduce or trace the bug using logs, test cases, or exact error stack traces before applying a solution.
2. **Find the Root Cause**: Do not simply patch a symptom (e.g. adding a null-check wrapper where the data should never have been null). Solve the systemic source of the error.
3. **Verify locally**: Always write/run a test case or trigger the execution path locally to verify the bug is eliminated.
4. **Isolate external effects**: Distinguish between network latency, environmental variables, database locks, and genuine logical bugs.

## Workflow
1. **Gather Evidence**: Retrieve the precise error message, stack trace, or buggy UI behavior.
2. **Isolate Code Area**: Use `grep` or `glob` to locate the throwing files and surrounding calls.
3. **Analyze Flow & Values**: Trace local variables, parameters, and database states. Look for race conditions, mutations, or off-by-one errors.
4. **Reproduce via Tests**: If possible, write a unit test that fails under the buggy condition.
5. **Implement Fix**: Apply a minimal, focused correction.
6. **Verify Correction**: Run tests to confirm the fix works and doesn't break regressions.

## Checklists
- [ ] Complete stack trace analyzed.
- [ ] Root cause identified (not just the symptom).
- [ ] Fix doesn't introduce side-effects or regressions.
- [ ] Clean and descriptive logging added for failure boundaries.
- [ ] Tests verifying the edge case have been run and passed.

## Common Mistakes
- **Shotgun Debugging**: Changing random lines of code hoping it compiles or fixes the issue without understanding the execution flow.
- **Silencing Warnings/Errors**: Using `try {} catch (e) {}` blocks with no logging or recovery logic, causing bugs to be hard-to-track silent failures.

## Validation Steps
1. Re-run the reproducing test case and ensure it now passes.
2. Ensure the whole test suite passes without regressions.
3. Verify that linter warnings are clean.
