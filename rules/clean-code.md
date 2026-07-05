# Clean Code Standards

## Purpose

Clean code is code that is easy to read, easy to understand, and easy to change. These are the enforceable standards that every line of code must meet. Clean code isn't about aesthetics — it's about reducing the cost of change over time.

---

## Rules

### 1. Functions MUST Be Small and Focused

**MUST:** A function does one thing at one level of abstraction.

**Guideline:** Functions SHOULD be under 20 lines. Functions over 30 lines MUST be split.

```
# BAD — does multiple things at multiple abstraction levels
def process_order(order_data):
    # Validate (high level)
    if not order_data.get("items"):
        raise ValueError("No items")
    if not order_data.get("customer_id"):
        raise ValueError("No customer")

    # Calculate totals (detail level)
    subtotal = 0
    for item in order_data["items"]:
        price = item["price"] * item["quantity"]
        if item.get("discount"):
            price = price * (1 - item["discount"])
        subtotal += price
    tax = subtotal * 0.08
    total = subtotal + tax

    # Save to database (infrastructure level)
    db.execute("INSERT INTO orders ...")

    # Send email (side effect level)
    smtp.send(customer.email, "Order confirmed", ...)

# GOOD — one thing per function, one level of abstraction
def process_order(order_data):
    validated_order = validate_order(order_data)
    priced_order = calculate_order_totals(validated_order)
    saved_order = save_order(priced_order)
    notify_customer(saved_order)
    return saved_order
```

### 2. Functions MUST Have Clear Inputs and Outputs

**MUST:** No hidden inputs (global state) or hidden outputs (unexpected side effects).

```
# BAD — hidden input and output
total_price = 0  # Global state

def add_item(item):
    global total_price
    total_price += item.price  # Hidden output: modifies global
    if config.TAX_ENABLED:     # Hidden input: reads global config
        total_price += item.price * TAX_RATE

# GOOD — explicit inputs and outputs
def calculate_total(items, tax_rate):
    subtotal = sum(item.price for item in items)
    tax = subtotal * tax_rate
    return subtotal + tax
```

### 3. Nesting MUST NOT Exceed 3 Levels

**MUST:** Maximum 3 levels of indentation. Deep nesting signals complex logic that needs extraction.

```
# BAD — 5 levels of nesting
def process(orders):
    for order in orders:
        if order.is_valid():
            for item in order.items:
                if item.in_stock():
                    if item.price > 0:
                        process_item(item)

# GOOD — extracted into readable functions with early returns
def process(orders):
    valid_orders = [o for o in orders if o.is_valid()]
    for order in valid_orders:
        process_order_items(order)

def process_order_items(order):
    processable_items = [i for i in order.items if is_processable(i)]
    for item in processable_items:
        process_item(item)

def is_processable(item):
    return item.in_stock() and item.price > 0
```

### 4. Guard Clauses MUST Replace Nested Conditionals

**MUST:** Use early returns to handle edge cases, keeping the main logic at the base indentation level.

```
# BAD — nested conditionals
def get_discount(user, order):
    if user is not None:
        if user.is_premium():
            if order.total > 100:
                return order.total * 0.15
            else:
                return order.total * 0.10
        else:
            return 0
    else:
        return 0

# GOOD — guard clauses
def get_discount(user, order):
    if user is None:
        return 0
    if not user.is_premium():
        return 0
    if order.total > 100:
        return order.total * 0.15
    return order.total * 0.10
```

### 5. No Magic Numbers or Strings

**MUST:** Named constants for all literal values that have domain meaning.

```
# BAD — what do these numbers mean?
if retry_count > 3:
    sleep(86400)
if user.age >= 18:
    grant_access()
if response.status == 429:
    back_off()

# GOOD — named constants convey meaning
MAX_RETRIES = 3
SECONDS_IN_DAY = 86400
LEGAL_ADULT_AGE = 18
HTTP_TOO_MANY_REQUESTS = 429

if retry_count > MAX_RETRIES:
    sleep(SECONDS_IN_DAY)
if user.age >= LEGAL_ADULT_AGE:
    grant_access()
if response.status == HTTP_TOO_MANY_REQUESTS:
    back_off()
```

### 6. Dead Code MUST Be Deleted

**MUST:** Never commit commented-out code, unused functions, unreachable branches, or deprecated code. Version control preserves history.

```
# BAD — dead code polluting the codebase
def calculate_price(product):
    # Old pricing logic - keeping just in case
    # price = product.base_price * 1.2
    # if product.category == "electronics":
    #     price = price * 0.95

    price = product.base_price * product.pricing_tier.multiplier
    return price

# GOOD — clean, no dead code
def calculate_price(product):
    return product.base_price * product.pricing_tier.multiplier
```

### 7. Conditionals MUST Be Positive

**SHOULD:** Prefer positive conditions. Avoid double negatives.

```
# BAD — double negative
if not is_not_valid:
    process()

if not user.is_disabled():
    allow_login()

# GOOD — positive conditions
if is_valid:
    process()

if user.is_active():
    allow_login()
```

### 8. Functions SHOULD Have No Side Effects Beyond Their Name

**SHOULD:** A function named `validate_user` should not also send an email. Side effects should be explicit in the function name or absent entirely.

```
# BAD — hidden side effect
def validate_user(user):
    if not user.email:
        raise ValidationError("Email required")
    user.last_validated_at = now()  # Side effect not in name!
    analytics.track("user_validated")  # Another hidden side effect!
    return True

# GOOD — name reflects what it does, or separate the effects
def validate_user(user):
    if not user.email:
        raise ValidationError("Email required")
    return True

def validate_and_record(user):  # Name reveals the side effect
    validate_user(user)
    record_validation(user)
```

---

## Anti-Patterns

### 1. The God Function
A function that handles an entire workflow, spanning hundreds of lines.
**Fix:** Extract into a pipeline of small, named functions.

### 2. Primitive Boolean Parameters
```
# ANTI-PATTERN
send_notification(user, True, False, True)

# FIX — use named parameters, enums, or dedicated functions
send_notification(user, channel=Channel.EMAIL, urgent=True)
```

### 3. Train Wreck (Law of Demeter Violation)
```
# ANTI-PATTERN — reaching through multiple levels
user.get_address().get_city().get_zip_code().format()

# FIX — ask the object to do it
user.formatted_zip_code()
```

### 4. Feature Envy
```
# ANTI-PATTERN — function uses more data from another class than its own
def calculate_order_total(order):
    return (order.item_price * order.quantity
            + order.shipping_cost - order.discount)

# FIX — this logic belongs on Order
class Order:
    def total(self):
        return self.item_price * self.quantity + self.shipping_cost - self.discount
```

---

## Quality Checklist

- [ ] All functions are under 20 lines (hard limit: 30)
- [ ] No function has more than 3 levels of nesting
- [ ] All edge cases handled with guard clauses at the top
- [ ] No magic numbers or strings (all in named constants)
- [ ] No commented-out code or unused functions
- [ ] No double negatives in conditionals
- [ ] No hidden side effects
- [ ] Each function does one thing at one level of abstraction
- [ ] All boolean flags are named (no positional True/False)
- [ ] No Law of Demeter violations (no chaining through object graphs)

---

## Common Mistakes

| Mistake                            | Consequence                                 | Fix                                       |
| ---------------------------------- | ------------------------------------------- | ----------------------------------------- |
| "I'll clean it up later"           | Later never comes, mess accumulates         | Clean as you go (Boy Scout Rule)          |
| Long functions "for readability"   | Actually harder to understand and modify    | Extract into well-named small functions   |
| Keeping dead code "just in case"   | Confusion, wasted cognitive load            | Delete it, git remembers                  |
| Deep nesting                       | Hard to follow all code paths               | Use guard clauses and extraction          |
| Clever one-liners                  | Impressive but unreadable                   | Prefer clarity over brevity               |

---

## Acceptance Criteria

Code is clean when:

1. A new developer can read any function and understand it in under 30 seconds
2. Modifying one behavior requires changing one place
3. No function requires scrolling to read entirely
4. The code reads like well-written prose — top to bottom, no backtracking
5. Anyone can confidently modify the code without fear of hidden side effects
