# Architecture Boundaries

## Purpose

Architecture boundaries define where one part of the system ends and another begins. Without clear boundaries, systems devolve into tangled monoliths where changing anything risks breaking everything. These rules govern how layers, modules, and features interact.

---

## Rules

### 1. The Dependency Rule — MUST

Dependencies MUST point inward. Outer layers depend on inner layers. Inner layers MUST NOT know about outer layers.

```
┌──────────────────────────────────────────┐
│  Infrastructure (DB, APIs, UI, Config)   │  → Knows about everything below
│  ┌──────────────────────────────────┐    │
│  │  Application (Use Cases, Orchestration)│  → Knows about Domain only
│  │  ┌──────────────────────────┐    │    │
│  │  │  Domain (Entities, Rules) │    │    │  → Knows about nothing
│  │  └──────────────────────────┘    │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

| Layer           | Depends On     | MUST NOT Depend On               |
| --------------- | -------------- | -------------------------------- |
| Domain          | Nothing        | Application, Infrastructure       |
| Application     | Domain         | Infrastructure                    |
| Infrastructure  | Application, Domain | (no restriction)             |

```
# VIOLATION — Domain imports from Infrastructure
# domain/order.py
from infrastructure.postgres_db import save  # Domain knows about database!

# CORRECT — Domain defines the interface, Infrastructure implements it
# domain/order_repository.py (interface)
class OrderRepository:
    def save(self, order): ...

# infrastructure/postgres_order_repository.py (implementation)
class PostgresOrderRepository(OrderRepository):
    def save(self, order):
        self.db.insert(order.to_dict())
```

### 2. Feature Independence — MUST

Features MUST NOT directly depend on other features. If two features need to communicate, they go through a shared abstraction or event system.

```
# VIOLATION — Feature A directly imports Feature B
# features/orders/order_service.py
from features.payments.payment_processor import PaymentProcessor  # Direct coupling!

# CORRECT Option A — Shared interface
# shared/interfaces/payment_interface.py
class PaymentInterface:
    def charge(amount, method): ...

# features/orders/order_service.py
class OrderService:
    def __init__(self, payment: PaymentInterface):  # Depends on shared abstraction
        self.payment = payment

# CORRECT Option B — Event-based communication
# features/orders/order_service.py
class OrderService:
    def complete_order(self, order):
        self.event_bus.publish(OrderCompletedEvent(order))
        # Payment feature subscribes to this event independently
```

### 3. Layer Communication — MUST

Each layer MUST communicate through defined interfaces, never by reaching through layers.

```
# VIOLATION — UI layer reaches directly into database
# presentation/order_screen.py
result = database.execute("SELECT * FROM orders WHERE user_id = ?", user.id)

# CORRECT — each layer talks only to the one below
# Presentation → Application
order_list = order_use_case.get_orders_for_user(user.id)

# Application → Domain + Repository
class GetOrdersUseCase:
    def get_orders_for_user(self, user_id):
        return self.order_repo.find_by_user(user_id)
```

### 4. Data Crosses Boundaries as Simple Structures — SHOULD

When data crosses a boundary, it SHOULD be converted to a format suitable for the receiving layer.

```
# VIOLATION — database entity leaks into UI
class OrderScreen:
    def render(self, db_row):
        # UI knows about database columns
        print(f"Order: {db_row['ord_id']}, Total: {db_row['ttl_amt']}")

# CORRECT — each layer has its own data representation
# Repository returns → Domain Entity
order = Order(id=row['ord_id'], total=Money(row['ttl_amt']))

# Use case returns → View Model
order_view = OrderViewModel(
    display_id=f"ORD-{order.id}",
    formatted_total=order.total.format()
)

# UI uses → View Model
class OrderScreen:
    def render(self, order_view: OrderViewModel):
        print(f"Order: {order_view.display_id}, Total: {order_view.formatted_total}")
```

### 5. Shared Code MUST Be Genuinely Shared — MUST

Code in `shared/` or `core/` MUST be used by 2+ features. Single-use code stays in its feature.

```
# VIOLATION — "shared" code used by only one feature
shared/
  format_order_number.py    # Only used by orders feature

# CORRECT — shared only when genuinely shared
features/orders/
  format_order_number.py    # Stays in its feature

# Later, when a second feature needs it:
shared/formatters/
  format_order_number.py    # Moved when genuinely shared
```

### 6. No Circular Dependencies — MUST

Module A depending on Module B depending on Module A is forbidden.

```
# VIOLATION — circular dependency
# module_a.py
from module_b import process_b
def process_a(data):
    return process_b(transform(data))

# module_b.py
from module_a import process_a
def process_b(data):
    return process_a(transform(data))

# RESOLUTION — extract shared logic or invert one dependency
# module_shared.py (extracted common dependency)
def transform(data): ...

# module_a.py
from module_shared import transform

# module_b.py
from module_shared import transform
```

---

## Boundary Identification

### How to Identify a Boundary

A boundary exists where:

1. **Teams differ** — Different teams own different sides
2. **Change rates differ** — UI changes weekly, domain changes monthly
3. **Technologies differ** — Web frontend vs. backend API vs. database
4. **Deployment units differ** — Independently deployable components
5. **Business domains differ** — Orders vs. Payments vs. Inventory

### Boundary Enforcement Strategies

| Strategy                  | Enforcement Level | When to Use                       |
| ------------------------- | ----------------- | --------------------------------- |
| Directory conventions     | Low               | Small teams, early-stage projects |
| Import rules (linting)    | Medium            | Growing codebases                 |
| Separate packages/modules | High              | Large teams, strict boundaries    |
| Separate repositories     | Highest           | Independent services              |

---

## Anti-Patterns

### 1. The Ball of Mud
No boundaries at all — everything imports everything.
**Symptom:** Changing a utility function breaks the database layer.
**Fix:** Introduce layers incrementally. Start with Domain vs. Everything Else.

### 2. The Leaky Abstraction Boundary
The boundary exists on paper but implementation details cross it.
**Symptom:** UI code handles database connection errors by type.
**Fix:** Convert errors at boundaries to the receiving layer's types.

### 3. The Shared Everything Architecture
Too much in `shared/`, features are empty shells.
**Symptom:** `shared/` has 100 files, features have 5 each.
**Fix:** Move code back to features. Shared should be the smallest part of the codebase.

### 4. Premature Service Extraction
Splitting into separate services before proving the boundary.
**Symptom:** Two services that always deploy together and share a database.
**Fix:** Start as a modular monolith. Extract to services when independently deployable.

---

## Decision Rules

1. **Should these be separate modules?** → Do they change independently and for different reasons? If yes, separate them.
2. **Where does this code belong?** → What layer is responsible for this decision? Put it there.
3. **Should this go in shared?** → Is it used by 2+ features today? If not, keep it in the feature.
4. **Should this be a separate service?** → Can it be independently deployed and operated? If not, keep it as a module.
5. **How strict should this boundary be?** → Proportional to team size and codebase age. Stricter as both grow.

---

## Quality Checklist

- [ ] Dependencies point inward (infrastructure → application → domain)
- [ ] Domain layer has zero imports from infrastructure or presentation
- [ ] No feature directly imports from another feature
- [ ] No circular dependencies between modules
- [ ] `shared/` contains only code used by 2+ features
- [ ] Data is converted at boundaries (no database entities in UI)
- [ ] Each layer communicates only with adjacent layers
- [ ] Boundary violations are caught by linting or import restrictions
- [ ] Adding a new feature doesn't require modifying existing features
- [ ] Each module can be understood without reading other modules

---

## Common Mistakes

| Mistake                              | Consequence                             | Fix                                       |
| ------------------------------------ | --------------------------------------- | ----------------------------------------- |
| Domain depends on framework          | Domain can't be reused or tested alone  | Invert dependency with interfaces         |
| Features coupled to each other       | Changing one feature breaks another     | Communicate through events or shared interfaces |
| Everything in shared                 | No feature isolation, huge blast radius | Move code to features, share only when needed |
| Skipping layers                      | UI talks to database directly           | Enforce layer communication protocol      |
| Over-engineering boundaries early    | Complexity without benefit              | Start simple, add boundaries when needed  |

---

## Acceptance Criteria

Architecture boundaries are acceptable when:

1. You can delete an entire feature directory and the rest of the system compiles
2. You can swap a database or external service by changing only the infrastructure layer
3. The domain layer can be tested with zero infrastructure setup
4. New features can be built in their own directory without touching other features
5. A developer can draw the system's layer diagram by reading the directory structure
