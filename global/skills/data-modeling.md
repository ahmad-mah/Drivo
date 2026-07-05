# Data Modeling

## Purpose

Data modeling defines how information is structured, related, and flows through a system. Poor data models force complex workarounds and brittle code. Good data models make business rules obvious and enforce constraints at the structural level. This skill covers how to design data structures that are correct, expressive, and maintainable.

---

## Core Principles

### 1. Make Illegal States Unrepresentable

Design your data structures so that invalid combinations are impossible to construct.

```
# BAD — allows illegal states
class Connection:
    status: str          # "connected", "disconnected", "error"
    connected_at: Date   # Meaningless when disconnected
    error_message: str   # Meaningless when connected
    # Nothing prevents: status="disconnected" with connected_at set

# GOOD — illegal states are structurally impossible
class Connection:
    # Only one of these can exist at a time
    Disconnected()
    Connected(connected_at: Date)
    Error(error_message: str, failed_at: Date)
```

### 2. Model the Domain, Not the Database

Data structures should reflect business concepts, not storage technology.

```
# BAD — database schema leaking into domain
class UserRecord:
    id: int
    name_first: str      # Column name conventions
    name_last: str
    addr_line1: str      # Flattened for storage
    addr_line2: str
    addr_city: str
    addr_zip: str
    flag_active: int     # 1 or 0 instead of boolean

# GOOD — domain model reflecting business concepts
class User:
    id: UserId
    name: FullName           # first, last
    address: Address         # line1, line2, city, zip
    is_active: bool
```

### 3. Use Types to Encode Meaning

Don't use primitive types when a domain-specific type would add clarity and safety.

```
# BAD — primitive obsession
def transfer(from_account: str, to_account: str, amount: float, currency: str):
    ...
# Easy to mix up from/to, use wrong currency, pass negative amount

# GOOD — types encode domain meaning
def transfer(from_account: AccountId, to_account: AccountId, money: Money):
    ...
# AccountId prevents mixing up accounts
# Money encapsulates amount + currency, prevents negative values
```

### 4. Immutability by Default

Prefer immutable data structures. They are easier to reason about, thread-safe, and prevent entire categories of bugs.

```
# BAD — mutable, any code can change this at any time
class Order:
    items = []
    total = 0

    def add_item(self, item):
        self.items.append(item)     # Mutates in place
        self.total += item.price    # Can get out of sync

# GOOD — immutable, changes create new instances
class Order:
    def __init__(self, items: FrozenList, total: Money):
        self.items = items
        self.total = total

    def with_item(self, item) -> Order:
        new_items = self.items + [item]
        new_total = self.total + item.price
        return Order(new_items, new_total)  # Returns new order
```

---

## Modeling Patterns

### Value Objects

Objects defined by their attributes, not identity. Two value objects with the same attributes are equal.

```
# Value objects: no identity, compared by value
class Money:
    amount: Decimal
    currency: Currency

    # Money(10, USD) == Money(10, USD) → True
    # Two $10 bills are interchangeable

class DateRange:
    start: Date
    end: Date
```

**Rules for value objects:**
- Always immutable
- Equality based on all attributes
- Encapsulate validation (Money rejects negative amounts)
- No database ID

### Entities

Objects defined by identity that persists over time. Two entities with the same attributes but different IDs are different.

```
# Entities: defined by identity
class User:
    id: UserId            # Identity
    name: FullName        # Can change, still same user
    email: Email          # Can change, still same user

    # User(id=1, name="Alice") != User(id=2, name="Alice")
    # Same name, different people
```

**Rules for entities:**
- Have a unique identifier
- Equality based on ID only
- May have mutable state (managed through methods)
- Enforce business invariants in their methods

### Aggregates

A cluster of entities and value objects treated as a single unit for consistency.

```
# Aggregate: Order is the root, OrderItems are internal
class Order:                              # Aggregate root
    id: OrderId
    items: List[OrderItem]                # Internal entities
    status: OrderStatus
    shipping_address: Address             # Value object

    def add_item(self, product, quantity):
        if self.status != OrderStatus.DRAFT:
            raise OrderFinalizedError()
        self.items.append(OrderItem(product, quantity))
        # Invariant: items are only added to draft orders

# External code only interacts with Order (the root), never directly with OrderItem
```

**Rules for aggregates:**
- One entity is the root — all external access goes through it
- The root enforces all invariants for the cluster
- External code never holds references to internal entities
- Aggregates are the unit of persistence (save/load the whole aggregate)

### Enumerations for Finite States

When a value can only be one of a known set, use an enumeration.

```
# Use enums for finite, known states
enum OrderStatus:
    DRAFT
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED

# State transitions are explicit
class Order:
    def confirm(self):
        if self.status != OrderStatus.DRAFT:
            raise InvalidTransitionError(self.status, OrderStatus.CONFIRMED)
        self.status = OrderStatus.CONFIRMED
```

---

## Data Flow Patterns

### DTOs (Data Transfer Objects)

Separate your domain models from the data structures used for transport/serialization.

```
# Domain model — rich behavior, business rules
class User:
    id: UserId
    name: FullName
    email: Email
    def can_place_order(self) -> bool: ...

# DTO — flat, serialization-friendly, no behavior
class UserDto:
    id: str
    first_name: str
    last_name: str
    email: str

# Mapper — converts between the two
class UserMapper:
    def to_dto(user: User) -> UserDto: ...
    def to_domain(dto: UserDto) -> User: ...
```

### Input vs Output Models

Use different models for input (what the consumer sends) and output (what the system returns).

```
# INPUT — only the fields needed for creation
class CreateUserInput:
    name: str
    email: str
    # No id (system generates it)
    # No created_at (system sets it)

# OUTPUT — includes system-generated fields
class UserOutput:
    id: str
    name: str
    email: str
    created_at: DateTime
    is_active: bool
```

---

## Anti-Patterns

### 1. Primitive Obsession
```
# ANTI-PATTERN — raw primitives everywhere
user_id = "abc-123"       # str
email = "a@b.com"          # str
price = 19.99              # float
currency = "USD"           # str
# Easy to pass email where user_id is expected

# FIX — wrap in domain types
user_id = UserId("abc-123")
email = Email("a@b.com")
price = Money(19.99, Currency.USD)
```

### 2. God Entity
```
# ANTI-PATTERN — one entity holds everything
class User:
    # Personal info
    name, email, phone, address...
    # Auth
    password_hash, login_attempts, last_login...
    # Preferences
    theme, language, notifications...
    # Orders
    order_history, cart, wishlist...
    # Social
    friends, messages, posts...
```
**Fix:** Split into focused aggregates: UserProfile, UserAuth, UserPreferences, etc.

### 3. Anemic Domain Model
```
# ANTI-PATTERN — data structure with no behavior
class Order:
    items: List
    status: str
    total: float

# All logic lives in separate service classes
class OrderService:
    def calculate_total(order): ...
    def can_cancel(order): ...
    def apply_discount(order, discount): ...
```
**Fix:** Put behavior on the entity where it belongs: `order.calculate_total()`, `order.cancel()`.

### 4. Shared Mutable State
```
# ANTI-PATTERN — same mutable object passed to multiple owners
config = {"timeout": 30}
service_a.configure(config)
service_b.configure(config)
config["timeout"] = 5  # Both services affected!
```
**Fix:** Use immutable data or give each consumer its own copy.

---

## Decision Rules

1. **Value object or entity?** → Does it have a lifecycle and identity that persists? Entity. Is it defined by its attributes? Value object.
2. **Single type or separate types?** → Do the fields always change together? Single type. Do they change independently? Separate types.
3. **Flat or nested?** → Does the sub-structure have meaning as a concept? Nest it. Is it just organizing data? Keep it flat.
4. **Mutable or immutable?** → Default to immutable. Make mutable only if immutability creates significant performance or complexity problems.
5. **Same model for input and output?** → Almost never. Input models accept less (no generated fields). Output models include more (computed/generated fields).

---

## Quality Checklist

- [ ] No primitive obsession — domain concepts have dedicated types
- [ ] Illegal states are unrepresentable in the data model
- [ ] Domain models contain behavior, not just data (no anemic models)
- [ ] Value objects are immutable
- [ ] Entities enforce their own invariants
- [ ] Aggregates have a single root that controls access
- [ ] DTOs are separate from domain models
- [ ] Input and output models are separate
- [ ] Enums are used for finite known states
- [ ] No shared mutable state between components

---

## Common Mistakes

| Mistake                               | Consequence                            | Fix                                        |
| ------------------------------------- | -------------------------------------- | ------------------------------------------ |
| Using strings for everything          | No type safety, easy to mix up values  | Create value types for domain concepts     |
| One model for read and write          | Over-fetching or under-validating      | Separate input/output models               |
| Business logic in services, not models| Anemic domain, logic scattered         | Put behavior on the entities               |
| Mutable shared objects                | Spooky action at a distance            | Use immutable data structures              |
| Database schema = domain model        | Domain couples to storage technology   | Map between domain and persistence models  |

---

## Acceptance Criteria

A data model is acceptable when:

1. It is impossible to construct an instance in an invalid state
2. Business rules are enforced by the model itself, not external validation
3. A developer reading the model understands the domain without additional documentation
4. Changing the storage technology requires zero changes to the domain model
5. Each concept has exactly one authoritative representation (no duplication)
