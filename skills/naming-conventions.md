# Naming Conventions

## Purpose

Naming is the most frequent design decision an engineer makes. Good names eliminate the need for comments, reduce cognitive load, and make code self-documenting. This skill covers how to choose names that communicate intent clearly and consistently.

---

## Core Principles

### 1. Names Reveal Intent

A name should answer three questions without requiring the reader to look at the implementation:
- **What** does this represent?
- **Why** does it exist?
- **How** is it used?

```
# BAD — requires reading implementation to understand
d = 7
temp = get_data()
flag = True

# GOOD — intent is immediately clear
max_retry_days = 7
active_user_profiles = fetch_active_profiles()
is_email_verified = True
```

### 2. Names Match Scope

The length and specificity of a name should be proportional to its scope.

| Scope          | Name Style            | Example                          |
| -------------- | --------------------- | -------------------------------- |
| Loop counter   | Single letter          | `i`, `j`, `k`                   |
| Lambda param   | Short, contextual      | `user`, `item`                   |
| Local variable | Concise, descriptive   | `retry_count`                    |
| Function       | Verb + noun            | `calculate_total_price`          |
| Class/Module   | Noun phrase            | `PaymentProcessor`               |
| Constant       | Full description       | `MAX_LOGIN_ATTEMPTS_BEFORE_LOCK` |

### 3. Names Use Consistent Vocabulary

Choose **one word** per concept and use it everywhere.

```
# BAD — mixed vocabulary for the same concept
fetch_users()
get_orders()
retrieve_products()
pull_invoices()

# GOOD — consistent vocabulary
fetch_users()
fetch_orders()
fetch_products()
fetch_invoices()
```

---

## Naming Categories

### Variables and Properties

| Pattern              | When to Use                      | Example                        |
| -------------------- | -------------------------------- | ------------------------------ |
| `is_<adjective>`     | Boolean state                    | `is_active`, `is_loading`      |
| `has_<noun>`         | Boolean possession               | `has_permission`, `has_errors` |
| `can_<verb>`         | Boolean capability               | `can_edit`, `can_delete`       |
| `should_<verb>`      | Boolean recommendation           | `should_retry`, `should_notify`|
| `<noun>_count`       | Numeric quantity                 | `error_count`, `item_count`    |
| `<noun>_list`        | Collection (when type is ambiguous) | `user_list`, `tag_list`     |
| `<noun>_map`         | Key-value structure              | `config_map`, `cache_map`      |
| `min_<noun>`/`max_<noun>` | Boundaries                 | `min_age`, `max_retries`       |

### Functions and Methods

| Pattern                    | When to Use                    | Example                          |
| -------------------------- | ------------------------------ | -------------------------------- |
| `<verb>_<noun>`            | Action on a thing              | `create_order`, `delete_user`    |
| `calculate_<noun>`         | Computation                    | `calculate_tax`                  |
| `validate_<noun>`          | Validation                     | `validate_email`                 |
| `format_<noun>`            | Transformation for display     | `format_currency`                |
| `parse_<noun>`             | Extraction from raw input      | `parse_config_file`              |
| `convert_<a>_to_<b>`       | Type or format conversion      | `convert_celsius_to_fahrenheit`  |
| `on_<event>`               | Event handler                  | `on_submit`, `on_click`          |
| `handle_<event>`           | Event processing logic         | `handle_payment_failure`         |

### Classes, Modules, and Types

| Pattern                    | When to Use                    | Example                          |
| -------------------------- | ------------------------------ | -------------------------------- |
| `<Noun>`                   | Domain entity                  | `User`, `Invoice`, `Product`     |
| `<Noun>Service`            | Business logic coordinator     | `PaymentService`                 |
| `<Noun>Repository`         | Data access abstraction        | `UserRepository`                 |
| `<Noun>Controller`         | Request/input handler          | `OrderController`                |
| `<Noun>Factory`            | Object creation                | `NotificationFactory`            |
| `<Noun>Validator`          | Validation logic               | `EmailValidator`                 |
| `<Noun>Mapper`             | Data transformation            | `UserDtoMapper`                  |
| `Abstract<Noun>`/`Base<Noun>` | Base abstractions           | `BaseRepository`                 |
| `I<Noun>` or `<Noun>Interface` | Interface contracts        | `ILogger`, `CacheInterface`      |

### Files and Directories

| Pattern                    | When to Use                    | Example                          |
| -------------------------- | ------------------------------ | -------------------------------- |
| `<feature>/`               | Feature grouping               | `auth/`, `payments/`             |
| `<noun>_<layer>`           | Layer-specific file            | `user_repository`, `order_model` |
| `<noun>_test`              | Test file                      | `user_service_test`              |
| `<noun>_mock`              | Test double                    | `payment_gateway_mock`           |

---

## Anti-Patterns

### 1. Meaningless Names
```
# ANTI-PATTERN
data = process(info)
result = do_thing(stuff)

# CORRECTION
validated_order = validate_order(raw_order_input)
```

### 2. Misleading Names
```
# ANTI-PATTERN — name suggests a list, but returns a single item
def get_users():
    return find_first_active_user()

# CORRECTION
def get_first_active_user():
    return find_first_active_user()
```

### 3. Encoding Type in Name (Hungarian Notation)
```
# ANTI-PATTERN
str_name = "Alice"
int_age = 30
arr_items = [1, 2, 3]

# CORRECTION — let the type system handle types
name = "Alice"
age = 30
items = [1, 2, 3]
```

### 4. Abbreviations That Obscure Meaning
```
# ANTI-PATTERN
usr_mgr = UserManager()
btn_clk_hndlr = handle_click
calc_ttl_prc = calculate_total_price

# CORRECTION
user_manager = UserManager()
handle_button_click = handle_click
calculate_total_price = calculate_total_price
```

### 5. Context Duplication
```
# ANTI-PATTERN — "user" repeated unnecessarily
class User:
    user_name = ""
    user_email = ""
    user_age = 0

# CORRECTION — context is provided by the class
class User:
    name = ""
    email = ""
    age = 0
```

---

## Decision Rules

1. **Can't think of a good name?** → You probably don't understand the concept well enough. Clarify the responsibility first.
2. **Name is too long (>4 words)?** → The thing is doing too much. Split the responsibility.
3. **Need a comment to explain the name?** → The name is bad. Rename it.
4. **Two things want the same name?** → They are either the same thing (merge them) or you haven't identified the distinction (refine the name).
5. **Tempted to use `utils`, `helpers`, `misc`?** → Find what the functions actually have in common and name by that shared concept.

---

## Quality Checklist

- [ ] Every name reveals intent without needing to read the implementation
- [ ] Boolean names start with `is_`, `has_`, `can_`, or `should_`
- [ ] Function names start with a verb
- [ ] Class/type names are noun phrases
- [ ] No abbreviations unless universally understood (`id`, `url`, `http`)
- [ ] Vocabulary is consistent across the codebase (one word per concept)
- [ ] No `utils`, `helpers`, `misc`, `stuff`, `data`, `info` as standalone names
- [ ] Name length is proportional to scope
- [ ] No context duplication (class name not repeated in member names)
- [ ] Names are pronounceable and searchable

---

## Common Mistakes

| Mistake                          | Why It's Wrong                                      | Fix                                        |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| Single-letter names outside loops | Unreadable, unsearchable                            | Use descriptive names                      |
| Generic names (`data`, `result`) | Provide zero information about what the thing is     | Name by what the data represents           |
| Negative booleans (`not_empty`)  | Double negation in conditionals is confusing          | Use positive form (`has_items`)            |
| Plural for single items          | Misleads the reader about cardinality                | Match name to actual cardinality           |
| Numbered suffixes (`user1`, `user2`) | Indicates unnamed concepts                      | Name by role (`sender`, `recipient`)       |

---

## Acceptance Criteria

A naming scheme is acceptable when:

1. A new team member can understand the code without asking questions about what names mean
2. A global search for any name returns only relevant results
3. No comments exist solely to explain what a name means
4. The naming pattern is consistent within each module/feature
5. Renaming a concept updates naturally across the codebase without ambiguity
