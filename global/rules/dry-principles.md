# DRY Principles — Without Overengineering

## Purpose

Don't Repeat Yourself (DRY) states that every piece of knowledge should have a single, authoritative representation. However, DRY is the most commonly misapplied principle in software engineering. This document defines when to deduplicate, when repetition is actually acceptable, and how to avoid the trap of premature abstraction in the name of DRY.

---

## Rules

### 1. DRY Applies to Knowledge, Not Code — MUST

DRY means that a **business rule** or **decision** should exist in one place. It does NOT mean that similar-looking code must be merged.

```
# TWO pieces of code that look similar but represent DIFFERENT knowledge:

# Order validation — business rule about orders
def validate_order(order):
    if order.total <= 0:
        raise InvalidOrderError("Total must be positive")
    if not order.items:
        raise InvalidOrderError("Must have items")

# Payment validation — business rule about payments
def validate_payment(payment):
    if payment.amount <= 0:
        raise InvalidPaymentError("Amount must be positive")
    if not payment.method:
        raise InvalidPaymentError("Must have payment method")

# These look similar but represent DIFFERENT domain rules.
# They will evolve independently. DO NOT merge them.
```

```
# ONE piece of knowledge duplicated in TWO places — this is a DRY violation:

# In order_service.py
TAX_RATE = 0.08
total_with_tax = subtotal * (1 + TAX_RATE)

# In invoice_service.py
TAX_RATE = 0.08  # Same knowledge, duplicated
total_with_tax = subtotal * (1 + TAX_RATE)

# FIX — single source of truth
# In config/tax.py
TAX_RATE = 0.08

# Both services import from config/tax.py
```

### 2. The Rule of Three — SHOULD

Do not abstract until you have **three** concrete, genuine cases of the same knowledge. Two similar cases are often coincidence.

```
# PREMATURE — abstracting after 2 instances
def send_notification(channel, recipient, message):
    if channel == "email":
        send_email(recipient, message)
    elif channel == "sms":
        send_sms(recipient, message)

# After 2 uses: "I'll create a NotificationStrategy interface,
#  a NotificationFactory, a NotificationRegistry..."

# CORRECT — wait for the 3rd instance
# 1st use: Just call send_email() directly
# 2nd use: Just call send_sms() directly
# 3rd use: NOW consider if these share enough to abstract
```

### 3. Prefer Duplication Over Wrong Abstraction — MUST

If you aren't sure whether two pieces of code represent the same knowledge, keep them separate. It's cheaper to merge duplicates later than to untangle a wrong abstraction.

```
# WRONG ABSTRACTION — merged things that shouldn't be merged
class GenericProcessor:
    def process(self, data, mode):
        if mode == "order":
            self.validate_order(data)
            self.calculate_order_total(data)
            self.save_order(data)
        elif mode == "refund":
            self.validate_refund(data)
            self.calculate_refund_amount(data)
            self.save_refund(data)
    # These share almost nothing. The abstraction adds complexity.

# CORRECT — keep separate until a genuine pattern emerges
class OrderProcessor:
    def process(self, order): ...

class RefundProcessor:
    def process(self, refund): ...
```

### 4. What MUST Be DRY

These categories MUST have a single source of truth:

| Category                  | Why                                               | Example                                    |
| ------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Business rules            | Multiple sources → inconsistent behavior          | Tax calculation, pricing rules              |
| Configuration values      | Multiple sources → deployment errors              | API endpoints, feature flags                |
| Data schema definitions   | Multiple sources → data corruption                | Entity definitions, validation schemas      |
| Error messages             | Multiple sources → confusing user experience     | User-facing error strings                   |
| Algorithm implementations | Multiple sources → divergent results              | Sorting, hashing, encoding algorithms       |

### 5. What CAN Be Repeated

These categories are acceptable to repeat:

| Category                  | Why Repetition Is OK                              | Example                                    |
| ------------------------- | ------------------------------------------------- | ------------------------------------------ |
| Boilerplate structure     | Different concerns, similar shape                 | Test setup, controller scaffolding          |
| Similar validation logic  | Different domains, evolve independently           | Order validation vs. Payment validation     |
| Data mapping              | Source and target evolve independently             | DTO to Domain mappers                       |
| Configuration per environment | Each environment has its own truth             | Dev config vs. production config            |

---

## Correct Deduplication Strategies

### Extract a Shared Function
When the same **calculation** or **transformation** appears in 3+ places:

```
# Before: same tax calculation in 3 places
order_tax = order.subtotal * 0.08
invoice_tax = invoice.subtotal * 0.08
quote_tax = quote.subtotal * 0.08

# After: single function
def calculate_tax(amount):
    return amount * TAX_RATE

order_tax = calculate_tax(order.subtotal)
invoice_tax = calculate_tax(invoice.subtotal)
```

### Extract a Configuration Constant
When the same **value** appears in 3+ places:

```
# Before: magic number scattered
sleep(3600)
cache_ttl = 3600
token_lifetime = 3600

# After: named constant
ONE_HOUR_SECONDS = 3600
```

### Extract a Base Class or Interface
When 3+ implementations share the same **contract** and **some common behavior**:

```
# When: EmailNotifier, SmsNotifier, PushNotifier all share:
# - send(recipient, message) contract
# - retry logic
# - logging

# Extract shared contract + behavior
class BaseNotifier:
    def send(self, recipient, message):
        self.log(recipient, message)
        with self.retry():
            self.deliver(recipient, message)

    def deliver(self, recipient, message):  # Subclass implements
        raise NotImplementedError
```

---

## Anti-Patterns

### 1. The Wrong Abstraction
```
# ANTI-PATTERN — merging coincidentally similar code
def handle_entity(type, data):
    if type == "user":
        # 50 lines of user-specific logic
    elif type == "product":
        # 50 lines of product-specific logic
    elif type == "order":
        # 50 lines of order-specific logic
    # Nothing is actually shared! The abstraction is empty.
```

### 2. DRY at the Cost of Readability
```
# ANTI-PATTERN — "reusing" code makes it harder to understand
def process(entity, mode, skip_validation=False, custom_transform=None,
            post_hook=None, error_strategy="raise"):
    # Generic function that handles everything through flags
    # Nobody can understand what this does without reading all callers

# BETTER — readable, focused functions even if they look similar
def process_order(order): ...
def process_refund(refund): ...
```

### 3. Coupling Through DRY
```
# ANTI-PATTERN — sharing creates coupling
# shared/validators.py
def validate_amount(amount):
    return amount > 0 and amount < 1000000

# Now orders, payments, and refunds are coupled through this validator.
# When payments needs to allow amounts > 1000000, you can't change
# the shared function without risking orders and refunds.
```

### 4. Abstraction for One
```
# ANTI-PATTERN — interface with a single implementation
class IUserRepository: ...
class UserRepository(IUserRepository): ...
# No other implementation exists or is planned
```

---

## Decision Rules

1. **Does this duplication represent the same knowledge?** → If yes, deduplicate. If it just looks similar, leave it.
2. **Have I seen this pattern 3 times?** → If not yet, keep duplicating. Wait for the pattern to stabilize.
3. **Will these evolve together or separately?** → If together (same reason to change), deduplicate. If separately, keep separate.
4. **Does deduplication add coupling?** → If merging forces unrelated modules to depend on each other, the duplication is healthier.
5. **Is the abstraction simpler than the duplication?** → If the abstracted version is harder to understand, keep the duplication.

---

## The DRY Decision Flowchart

```
Is this the same KNOWLEDGE (not just similar code)?
├─ NO → Keep duplicated. Done.
└─ YES → Have you seen it 3+ times?
    ├─ NO → Keep duplicated. Wait for more evidence.
    └─ YES → Will these cases evolve together?
        ├─ NO → Keep duplicated. They're different concerns.
        └─ YES → Does the abstraction add coupling between unrelated modules?
            ├─ YES → Consider a local helper instead of a shared abstraction.
            └─ NO → Extract a shared abstraction. ✓
```

---

## Quality Checklist

- [ ] Every business rule exists in exactly one place
- [ ] Configuration values are defined once, referenced everywhere
- [ ] No premature abstractions (all abstractions have 2+ real implementations or 3+ callers)
- [ ] Similar code in different domains is intentionally duplicated (not forcefully merged)
- [ ] Shared code does not create coupling between unrelated features
- [ ] Abstractions are simpler to understand than the duplication they replace
- [ ] No "generic" functions with mode/type flags that branch into entirely different logic
- [ ] The Rule of Three is followed: no abstraction before 3 concrete cases

---

## Common Mistakes

| Mistake                                | Consequence                            | Fix                                        |
| -------------------------------------- | -------------------------------------- | ------------------------------------------ |
| Merging similar-looking code too early | Wrong abstraction, expensive to undo   | Wait for 3 instances, verify same knowledge|
| DRY across feature boundaries          | Features coupled through shared code   | Keep feature-specific code in features     |
| Never duplicating anything             | Over-abstracted, rigid codebase        | Accept healthy duplication                 |
| Ignoring DRY for business rules        | Inconsistent behavior across the system| Business rules MUST be single source       |
| Abstracting to prevent copy-paste      | Abstraction that doesn't match the domain | Focus on knowledge, not code shape      |

---

## Acceptance Criteria

DRY application is acceptable when:

1. Changing a business rule requires editing exactly one place
2. No shared abstraction exists with only one implementation and no test substitution
3. Similar code in different domains is intentionally kept separate
4. Every abstraction makes the code easier to understand, not harder
5. Removing a shared abstraction and replacing with duplication is never considered an improvement (if it would be, the abstraction is wrong)
