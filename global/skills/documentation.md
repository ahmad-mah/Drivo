# Documentation

## Purpose

Documentation bridges the gap between what code does and why it exists. The best documentation answers questions before they're asked, without duplicating what the code already says. This skill covers how to write documentation that is useful, maintainable, and appropriately scoped.

---

## Core Principles

### 1. Code Is the Primary Documentation

Well-written code with good names, clear structure, and small functions is the best documentation. Written documentation should supplement code, not compensate for unclear code.

```
# BAD — comment compensates for bad code
# Check if the user is eligible for a discount based on their
# membership level being premium and their account being active
# for more than 30 days
if u.ml == 2 and (now() - u.cd).days > 30:

# GOOD — code is self-documenting, no comment needed
if user.is_premium_member() and user.account_age_days() > 30:
```

### 2. Document Why, Not What

Comments should explain **intent**, **trade-offs**, and **decisions** — things the code cannot express.

```
# BAD — states the obvious (what)
count = count + 1  # Increment count by one

# GOOD — explains intent (why)
# Using exponential backoff to avoid overwhelming the payment
# service during partial outages. Linear retry caused cascading
# failures in incident INC-2024-0312.
retry_delay = base_delay * (2 ** attempt_number)
```

### 3. Documentation Has a Clear Audience

Every document is written for a specific reader. Identify them before writing.

| Document Type        | Audience                  | Content Focus                          |
| -------------------- | ------------------------- | -------------------------------------- |
| Code comments        | Future developer          | Why this approach, not another         |
| API documentation    | API consumer              | How to use it, not how it works        |
| Architecture docs    | New team member           | System structure and key decisions     |
| README               | First-time contributor    | Setup, run, test, deploy               |
| Runbooks             | On-call engineer          | Step-by-step incident response         |
| Decision records     | Future architects         | Why this was chosen over alternatives  |

### 4. Keep Documentation Close to Code

Documentation that lives near the code it describes is more likely to be updated when the code changes.

```
# GOOD — documentation co-located with code
features/
  payments/
    README.md                 # Payment feature overview
    payment_service            # Code + inline docs
    payment_flow_diagram.md   # Visual flow

# BAD — documentation in a separate silo
docs/
  payments.md                 # Far from the code, easily forgotten
src/
  features/
    payments/
      payment_service          # Code changes, docs don't update
```

---

## Documentation Types

### Code Comments

**When to comment:**
- Explaining **why** a non-obvious approach was chosen
- Warning about **consequences** (side effects, performance implications)
- Providing **context** that can't be expressed in code (business rules, regulatory requirements)
- Marking **temporary** code with clear follow-up (TODO with ticket/issue reference)

**When NOT to comment:**
- Restating what the code does
- Explaining language syntax
- Commenting out dead code (delete it — version control remembers)
- Writing a novel before every function

```
# GOOD comments — each adds value beyond what code expresses

# Regulatory requirement: EU customers must have tax calculated
# before any discount is applied. See GDPR-TAX-2024 spec.
tax = calculate_tax(subtotal)
discounted_total = apply_discount(subtotal + tax, discount)

# WARNING: This cache has no TTL. Manual invalidation required
# when product catalog is updated. See runbook/cache-invalidation.md.
product_cache = load_full_catalog()

# TODO(TICKET-4521): Replace with streaming parser when files exceed 1GB
data = load_entire_file_into_memory(path)
```

### Function/Method Documentation

Document the **contract**, not the implementation.

```
# GOOD — documents contract: what it expects, what it returns, when it fails
def calculate_shipping_cost(order, destination):
    """
    Calculate shipping cost for an order to a destination.

    Args:
        order: Must contain at least one item with weight > 0.
        destination: A valid shipping address with country code.

    Returns:
        Money: The calculated shipping cost in the order's currency.

    Raises:
        InvalidDestinationError: If destination country is not in
            our supported shipping regions.
        EmptyOrderError: If order contains no items.
    """

# BAD — describes implementation steps
def calculate_shipping_cost(order, destination):
    """
    First gets the total weight by iterating items and summing weights.
    Then looks up the rate table for the destination country.
    Multiplies weight by rate and adds handling fee.
    Returns the result as Money.
    """
```

### README Structure

Every project should have a README that answers these questions in order:

```markdown
# Project Name
One-sentence description of what this does.

## Quick Start
Minimum steps to get running (3-5 commands max).

## Prerequisites
What needs to be installed before setup.

## Development Setup
Full setup instructions with all configuration.

## Project Structure
Brief overview of directory layout and where to find things.

## Running Tests
How to run the test suite.

## Deployment
How to deploy to each environment.

## Architecture
Link to architecture documentation (if complex).

## Contributing
Code style, branch strategy, PR process.
```

### Architecture Decision Records (ADRs)

Capture significant technical decisions with context.

```markdown
# ADR-001: Use Event Sourcing for Order History

## Status
Accepted

## Context
We need to maintain a complete audit trail of all order changes
for regulatory compliance. The current approach of overwriting
order state loses history.

## Decision
Implement event sourcing for the Order aggregate. All state changes
are recorded as immutable events. Current state is derived by
replaying events.

## Consequences
### Positive
- Complete audit trail without additional logging
- Can reconstruct state at any point in time
- Natural fit for event-driven architecture

### Negative
- More complex read queries (need projections)
- Larger storage requirements
- Team needs training on event sourcing patterns

## Alternatives Considered
1. **Audit log table**: Simpler but disconnected from domain model
2. **Database triggers**: Fragile, hard to test, couples to storage
```

---

## Anti-Patterns

### 1. Redundant Comments
```
# ANTI-PATTERN — adds no information beyond what code says
user.save()  # Save the user
count += 1   # Increment count
return result # Return result
```

### 2. Stale Documentation
```
# ANTI-PATTERN — documentation doesn't match current code
# NOTE: Uses the legacy V1 authentication system
auth_service.authenticate_v3(token)  # Actually uses V3 now
```
**Fix:** Update docs when code changes, or delete them if they can't be maintained.

### 3. Documentation as Excuse for Bad Code
```
# ANTI-PATTERN — long explanation of confusing code
# This function takes the user data map and extracts the nested
# profile object, then checks if the address sub-object contains
# a valid postal code by regex matching against the country-specific
# format stored in the config map under the "postal" key...
def f(d):
    return bool(re.match(cfg["postal"][d["p"]["a"]["cc"]], d["p"]["a"]["z"]))

# FIX — make the code readable instead
def is_valid_postal_code(user_profile):
    country = user_profile.address.country_code
    postal_code = user_profile.address.postal_code
    pattern = postal_code_patterns.get(country)
    return pattern.matches(postal_code)
```

### 4. TODO Without Context
```
# ANTI-PATTERN
# TODO: fix this
# TODO: refactor later
# TODO: handle edge case

# CORRECT
# TODO(PROJ-1234): Handle concurrent modification when two users
#   edit the same order simultaneously. Current behavior: last write wins.
```

### 5. Documenting Every Function
```
# ANTI-PATTERN — trivial functions don't need docs
def is_empty(collection):
    """
    Check if the given collection is empty.

    Args:
        collection: The collection to check.

    Returns:
        bool: True if the collection is empty, False otherwise.
    """
    return len(collection) == 0
```
**Fix:** Only document functions where the signature alone is insufficient.

---

## Decision Rules

1. **Should I write a comment?** → Would a good developer be confused reading this code without the comment? If yes, add one. If the code is clear, don't.
2. **Comment or rename?** → Always try renaming first. A good name eliminates the need for most comments.
3. **Where should this doc live?** → As close to the code as possible. Module-level docs in the module directory. System-level docs in the project root.
4. **Should I write an ADR?** → Did you consider multiple approaches and choose one for specific reasons? If yes, record it.
5. **Is this doc worth maintaining?** → Will someone read it more than once? Will it save time in the future? If yes to either, write it.

---

## Quality Checklist

- [ ] No comments that restate what the code does
- [ ] Every non-obvious decision has a "why" comment
- [ ] All TODOs reference a ticket/issue number
- [ ] README covers setup, run, test, and deploy
- [ ] API functions document their contract (inputs, outputs, errors)
- [ ] No commented-out code (use version control instead)
- [ ] Documentation is co-located with the code it describes
- [ ] Significant technical decisions are recorded as ADRs
- [ ] No stale documentation that contradicts current code
- [ ] Documentation has a clear audience and purpose

---

## Common Mistakes

| Mistake                              | Consequence                            | Fix                                        |
| ------------------------------------ | -------------------------------------- | ------------------------------------------ |
| Documenting how instead of why       | Docs become stale when code changes    | Focus on intent and decisions              |
| No documentation at all              | Tribal knowledge, bus factor of 1      | Document architecture and key decisions    |
| Over-documenting trivial code        | Noise drowns out important comments    | Only document the non-obvious              |
| Docs far from code                   | Forgotten, never updated               | Co-locate with the code it describes       |
| No README or outdated README         | New developers can't get started       | Maintain a current, working README         |

---

## Acceptance Criteria

Documentation is acceptable when:

1. A new team member can set up and run the project using only the README
2. Every "why" question about a non-obvious code choice is answered by a nearby comment
3. No documentation contradicts the current code
4. Key architectural decisions are recorded with context and alternatives
5. The documentation makes the reader more productive, not less (no noise)
