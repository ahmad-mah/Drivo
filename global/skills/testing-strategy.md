# Testing Strategy

## Purpose

Testing is the engineering practice that provides confidence to change code. This skill covers how to design a test strategy that catches real bugs, runs fast, and doesn't become a maintenance burden. Tests should serve as living documentation of system behavior.

---

## Core Principles

### 1. The Testing Pyramid

Structure tests in layers, with more fast/cheap tests at the bottom and fewer slow/expensive tests at the top.

```
        /  E2E Tests  \          ← Few: critical user journeys only
       / Integration    \        ← Some: verify component collaboration
      /   Unit Tests      \      ← Many: fast, isolated, exhaustive
     ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

| Layer           | Speed     | Scope                     | Count    | What It Tests                              |
| --------------- | --------- | ------------------------- | -------- | ------------------------------------------ |
| Unit            | < 10ms    | Single function/class     | Hundreds | Logic correctness                          |
| Integration     | < 1s      | Multiple components       | Dozens   | Component collaboration, data flow         |
| End-to-End      | < 30s     | Full system               | Few      | Critical user journeys                     |

### 2. Test Behavior, Not Implementation

Tests should verify **what** the code does, not **how** it does it internally. This makes tests resilient to refactoring.

```
# BAD — coupled to implementation details
def test_add_user():
    service = UserService()
    service.add_user("Alice")
    assert service._internal_list[0] == "Alice"  # Testing private state
    assert service._save_called == True            # Testing internal flag

# GOOD — tests observable behavior
def test_add_user():
    service = UserService()
    service.add_user("Alice")
    assert service.get_user("Alice") is not None   # Verify through public API
    assert service.user_count() == 1               # Verify observable outcome
```

### 3. Each Test Tests One Thing

A test should have a single reason to fail. If a test fails, you should immediately know what's broken.

```
# BAD — multiple assertions testing different behaviors
def test_user_service():
    service = UserService()
    service.add("Alice")
    assert service.count() == 1          # Tests adding
    service.remove("Alice")
    assert service.count() == 0          # Tests removing
    assert service.find("Alice") is None # Tests finding

# GOOD — separate tests for separate behaviors
def test_add_increments_count():
    service = UserService()
    service.add("Alice")
    assert service.count() == 1

def test_remove_decrements_count():
    service = UserService()
    service.add("Alice")
    service.remove("Alice")
    assert service.count() == 0
```

### 4. Arrange-Act-Assert (AAA)

Every test follows three clear phases:

```
def test_discount_applied_for_premium_users():
    # ARRANGE — set up the preconditions
    user = create_premium_user()
    order = create_order(items=[item(price=100)])

    # ACT — perform the action under test
    total = calculate_total(order, user)

    # ASSERT — verify the outcome
    assert total == 90  # 10% premium discount
```

---

## What to Test

### Always Test
- **Business rules** — the core logic that makes your application valuable
- **Boundary conditions** — empty inputs, maximum values, off-by-one edges
- **Error paths** — what happens when things go wrong
- **State transitions** — moving between valid states
- **Data transformations** — input → output mappings

### Don't Test
- **Framework/library code** — it's already tested by its maintainers
- **Trivial getters/setters** — no logic means nothing to break
- **Private implementation details** — test through the public interface
- **Configuration** — unless it contains logic
- **Generated code** — test the generator, not its output

---

## Test Naming

Test names should read as a specification of the system's behavior.

```
# Pattern: <unit>_<scenario>_<expected_result>

test_calculate_tax_with_zero_income_returns_zero()
test_login_with_expired_token_returns_unauthorized()
test_add_item_when_cart_is_full_throws_capacity_error()

# Alternative pattern: should_<expected>_when_<scenario>

should_return_zero_tax_when_income_is_zero()
should_reject_login_when_token_is_expired()
```

---

## Test Doubles

Use the right kind of test double for each situation:

| Double    | Purpose                                      | When to Use                                 |
| --------- | -------------------------------------------- | ------------------------------------------- |
| **Stub**  | Returns predetermined responses              | External service not available               |
| **Mock**  | Verifies interactions were made               | Verifying side effects (emails, logs)        |
| **Fake**  | Simplified working implementation             | In-memory database replacement               |
| **Spy**   | Records calls for later assertion             | Verifying call patterns                      |

### Rules for Test Doubles
- Prefer **stubs** over **mocks** — verify state, not interactions
- Never mock what you own — use fakes for internal components
- Mock at **architectural boundaries** — external APIs, databases, file systems
- If you need too many mocks, the code has too many dependencies — refactor it

---

## Anti-Patterns

### 1. The God Test
```
# ANTI-PATTERN — one test covers the entire feature
def test_user_registration():
    # 200 lines of setup, actions, and assertions
    # covering validation, saving, emailing, and logging
```
**Fix:** Split into focused tests, one behavior per test.

### 2. The Fragile Test
```
# ANTI-PATTERN — breaks when implementation changes
def test_save_user():
    mock_db.expect_call("INSERT INTO users VALUES ('Alice', 30)")
    service.save(User("Alice", 30))
    mock_db.verify()
```
**Fix:** Test the outcome (user is retrievable), not the SQL string.

### 3. The Sleeper
```
# ANTI-PATTERN — uses real time delays
def test_cache_expiration():
    cache.set("key", "value", ttl=60)
    time.sleep(61)  # Test takes 61 seconds!
    assert cache.get("key") is None
```
**Fix:** Inject a clock/timer and advance it programmatically.

### 4. Test Without Assertion
```
# ANTI-PATTERN — "tests" that just run code
def test_process_data():
    process_data(sample_input)
    # No assertion — what are we verifying?
```
**Fix:** Every test must assert a specific expected outcome.

### 5. Shared Mutable State Between Tests
```
# ANTI-PATTERN — tests depend on each other's state
shared_list = []

def test_add():
    shared_list.append("item")
    assert len(shared_list) == 1

def test_count():
    assert len(shared_list) == 1  # Fails if test_add runs after
```
**Fix:** Each test creates its own fresh state.

---

## Decision Rules

1. **Should I write a test for this?** → Does it contain logic (conditionals, loops, calculations)? If yes, test it.
2. **Unit or integration test?** → Does it depend on external systems? If no, unit test. If yes, integration test.
3. **How many tests for this function?** → One per behavior: happy path + each edge case + each error case.
4. **Should I mock this dependency?** → Is it at an architectural boundary (DB, network, file system)? If yes, mock/fake it. If no, use the real thing.
5. **Is this test worth the maintenance cost?** → Does it protect against a real bug that would reach production? If yes, keep it.

---

## Quality Checklist

- [ ] Tests follow the AAA pattern (Arrange-Act-Assert)
- [ ] Each test verifies exactly one behavior
- [ ] Test names describe the scenario and expected outcome
- [ ] No test depends on the execution order of other tests
- [ ] No real time delays (sleep) in tests
- [ ] No network calls in unit tests
- [ ] Test doubles are used only at architectural boundaries
- [ ] Edge cases are covered (empty, null, max, negative, duplicate)
- [ ] Error paths are tested, not just happy paths
- [ ] All tests pass when run in isolation AND in any order

---

## Common Mistakes

| Mistake                           | Consequence                                | Fix                                        |
| --------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Testing implementation, not behavior | Tests break on every refactor           | Assert on outputs, not internal state      |
| No tests for error cases          | Bugs in error handling reach production    | Test every `catch`/`else` path             |
| Copy-pasting test setup           | Maintenance nightmare                      | Extract shared setup into helpers/fixtures |
| Over-mocking                      | Tests pass but real integrations are broken| Use fakes for internal, mocks for external |
| Slow test suite                   | Developers stop running tests              | Push tests down the pyramid                |

---

## Acceptance Criteria

A test suite is acceptable when:

1. All tests pass consistently (no flaky tests)
2. The full unit test suite runs in under 60 seconds
3. A failing test clearly identifies what behavior broke
4. Tests serve as readable documentation of system behavior
5. Developers have confidence to refactor code because tests will catch regressions
