# API Design

## Purpose

An API (Application Programming Interface) is any contract between a provider and a consumer — whether it's a public HTTP endpoint, an internal module interface, or a function signature. Good API design makes systems intuitive to use, hard to misuse, and resilient to evolution. This skill covers how to design interfaces that other developers (and your future self) will find clear and predictable.

---

## Core Principles

### 1. Easy to Use Correctly, Hard to Use Incorrectly

The best API guides the consumer toward correct usage through its structure alone.

```
# BAD — easy to misuse (what do these booleans mean?)
create_user("Alice", True, False, True)

# GOOD — named parameters or builder pattern
create_user(
    name="Alice",
    is_admin=True,
    send_welcome_email=False,
    require_email_verification=True
)
```

```
# BAD — accepts any string, errors at runtime
set_status("actve")  # Typo, discovered in production

# GOOD — constrained to valid values
set_status(Status.ACTIVE)  # Invalid values are impossible
```

### 2. Minimal Surface Area

Expose the smallest possible API that covers the use cases. Every public element is a commitment to maintain.

```
# BAD — exposes internal mechanics
class UserService:
    def get_db_connection(): ...
    def build_sql_query(table, conditions): ...
    def execute_query(sql): ...
    def map_row_to_user(row): ...
    def get_user(id): ...

# GOOD — exposes only what consumers need
class UserService:
    def get_user(id): ...
    def list_users(filters): ...
    def create_user(data): ...
```

### 3. Consistent Conventions

Every API should follow the same patterns for similar operations.

```
# BAD — inconsistent patterns
get_user(id)           # Returns User
find_orders(filter)    # Returns list
fetch_product(sku)     # Returns optional
load_invoice(number)   # Returns or throws

# GOOD — consistent patterns
get_user(id)           # All use same verb
get_orders(filter)     # All return same shape
get_product(sku)       # All handle absence the same way
get_invoice(number)    # Predictable behavior
```

### 4. Backward Compatibility by Default

Changes should add, not remove or modify existing behavior.

```
# Evolution strategy:
# v1: get_user(id) → User
# v2: get_user(id, include_profile=False) → User  # Added optional param, default preserves v1 behavior

# NEVER:
# v1: get_user(id) → User
# v2: get_user(id) → UserWithProfile  # Breaking change for all consumers
```

---

## Design Patterns

### Request/Response Objects

For operations with multiple parameters, use dedicated objects instead of long parameter lists.

```
# BAD — too many parameters, easy to misorder
def search_users(query, page, size, sort_by, sort_dir, include_inactive, department):
    ...

# GOOD — encapsulated in a request object
def search_users(request: SearchUsersRequest):
    ...

class SearchUsersRequest:
    query: str
    pagination: Pagination  # page, size
    sort: SortCriteria      # field, direction
    include_inactive: bool = False
    department: str = None
```

### Pagination

For any API that returns collections, support pagination from day one.

```
# Standard pagination response structure:
{
    items: [...],           # The actual data
    total_count: 150,       # Total items matching the query
    page: 2,                # Current page
    page_size: 20,          # Items per page
    has_next_page: True     # Quick check for more data
}
```

### Idempotency

Operations that can be safely retried without side effects reduce error handling complexity.

```
# IDEMPOTENT — safe to retry
GET  /users/123              # Always returns same user
PUT  /users/123 {name: "A"}  # Always sets name to "A"
DELETE /users/123            # First call deletes, subsequent calls return "already deleted"

# NOT IDEMPOTENT — retry causes problems
POST /orders {item: "X"}    # Each call creates a new order
```

### Error Response Contracts

Errors should follow a consistent, machine-parseable structure.

```
# Standard error response:
{
    error: {
        code: "VALIDATION_ERROR",          # Machine-readable code
        message: "Email is invalid",        # Human-readable description
        field: "email",                     # What field caused the error (if applicable)
        details: [                          # Optional additional context
            { field: "email", rule: "format", message: "Must be a valid email address" }
        ]
    }
}
```

---

## Interface Design Rules

### Parameter Design

| Parameter Count | Recommendation                                    |
| --------------- | ------------------------------------------------- |
| 0-2             | Individual parameters are fine                     |
| 3-4             | Consider a parameter object                        |
| 5+              | Mandatory: use a parameter/request object          |

### Return Value Design

| Scenario                      | Return Strategy                              |
| ----------------------------- | -------------------------------------------- |
| Always has a result           | Return the value directly                    |
| Might not have a result       | Return optional/nullable (not an error)      |
| Something can go wrong        | Return a result type or throw domain error   |
| Returns a collection          | Return empty collection, never null          |
| Long-running operation        | Return a handle/token for status checking    |

### Naming Conventions for APIs

| Operation | Verb      | Example                    |
| --------- | --------- | -------------------------- |
| Read one  | `get`     | `get_user(id)`             |
| Read many | `list`    | `list_users(filter)`       |
| Create    | `create`  | `create_user(data)`        |
| Update    | `update`  | `update_user(id, changes)` |
| Delete    | `delete`  | `delete_user(id)`          |
| Search    | `search`  | `search_users(query)`      |
| Check     | `exists`  | `user_exists(id)`          |
| Count     | `count`   | `count_users(filter)`      |

---

## Anti-Patterns

### 1. Anemic Interface
```
# ANTI-PATTERN — exposes raw data, no encapsulated behavior
class OrderService:
    def get_order_data(): ...     # Returns raw dict
    def set_order_data(data): ... # Accepts any dict

# CORRECT — encapsulates behavior
class OrderService:
    def place_order(items, customer): ...
    def cancel_order(order_id, reason): ...
```

### 2. Boolean Trap
```
# ANTI-PATTERN — what do these booleans mean at the call site?
render(data, True, False)

# CORRECT — use named parameters, enums, or separate methods
render(data, format=Format.HTML, include_header=False)
# OR
render_html(data, include_header=False)
```

### 3. Stringly-Typed API
```
# ANTI-PATTERN — accepts any string, fails at runtime
set_color("redd")  # Typo, discovered in production
execute_action("delet")  # Typo, deletes nothing, silently

# CORRECT — use types/enums to constrain input
set_color(Color.RED)
execute_action(Action.DELETE)
```

### 4. Leaky Abstraction
```
# ANTI-PATTERN — internal implementation details leak through the API
def get_users(sql_where_clause: str): ...  # Exposes database technology

# CORRECT — abstracts the implementation
def get_users(filter: UserFilter): ...  # Implementation-agnostic
```

### 5. Flag Arguments That Create Two Functions
```
# ANTI-PATTERN — boolean flag makes function do two completely different things
def send_message(message, is_urgent):
    if is_urgent:
        # 50 lines of urgent sending logic
    else:
        # 50 lines of normal sending logic

# CORRECT — two separate functions
def send_message(message): ...
def send_urgent_message(message): ...
```

---

## Decision Rules

1. **Should this be one function or two?** → If a boolean parameter completely changes the behavior, make it two functions.
2. **Should I accept a dict/map or a typed object?** → If the shape of the data matters, use a typed object. Dicts are for genuinely dynamic data.
3. **Should I return null or throw?** → If absence is normal (user search returns no results), return empty/null. If absence is exceptional (get user by known ID), throw.
4. **Should I add this parameter?** → Does every caller need it? If only some do, use an options/config object with defaults.
5. **Should I expose this method publicly?** → Is there a consumer who needs it today? If not, keep it private.

---

## Quality Checklist

- [ ] API has a consistent naming convention (same verbs for same operations)
- [ ] No function has more than 4 individual parameters (use objects beyond that)
- [ ] No boolean parameters that change function behavior entirely
- [ ] Collections always return empty (never null)
- [ ] Error responses follow a consistent structure
- [ ] All optional parameters have sensible defaults
- [ ] The API can evolve without breaking existing consumers
- [ ] Input is constrained by types/enums wherever possible (not raw strings)
- [ ] Internal implementation details do not leak through the interface
- [ ] Every public method has a clear, single purpose

---

## Common Mistakes

| Mistake                              | Consequence                             | Fix                                       |
| ------------------------------------ | --------------------------------------- | ----------------------------------------- |
| Exposing implementation details      | Consumers coupled to internals          | Design around use cases, not internals    |
| Inconsistent return types            | Consumers need special-case handling    | Standardize return shapes                |
| No pagination for collections       | Performance degrades as data grows      | Add pagination from day one              |
| Accepting raw strings for known sets | Runtime errors from typos               | Use enums or constants                    |
| Too many public methods              | Hard to learn, hard to maintain         | Start minimal, expand based on need       |

---

## Acceptance Criteria

An API design is acceptable when:

1. A consumer can use the API correctly on their first attempt by reading only the method signatures
2. It is impossible to pass invalid data through types alone (no runtime validation needed for shape)
3. Adding a new feature to the API does not require existing consumers to change
4. Error responses are informative enough to debug issues without reading source code
5. The API surface is small enough to fit in a single documentation page
