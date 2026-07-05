# SOLID Principles — Applied Pragmatically

## Purpose

SOLID principles guide the design of maintainable, flexible systems. However, applying them dogmatically creates over-engineered code. This document presents each principle with pragmatic guidelines for **when to apply it** and **when to relax it**.

---

## The Principles

### S — Single Responsibility Principle (SRP)

**Rule:** A component should have one, and only one, reason to change.

**What this means in practice:** Group code that changes for the same reason. Separate code that changes for different reasons.

```
# VIOLATION — changes for multiple reasons
class UserManager:
    def create_user(data): ...          # Changes when user creation rules change
    def send_welcome_email(user): ...   # Changes when email templates change
    def generate_user_report(): ...     # Changes when reporting requirements change
    def validate_password(pwd): ...     # Changes when security policy changes

# COMPLIANT — each class has one reason to change
class UserService:
    def create_user(data): ...

class WelcomeEmailSender:
    def send(user): ...

class UserReportGenerator:
    def generate(): ...

class PasswordValidator:
    def validate(pwd): ...
```

**When to relax:** Simple CRUD operations on a single entity can stay in one class. Don't split until complexity warrants it.

**Decision rule:** Ask "What could cause this class to change?" If you get more than one unrelated answer, split it.

---

### O — Open/Closed Principle (OCP)

**Rule:** Software should be open for extension but closed for modification.

**What this means in practice:** Add new behavior by adding new code (new classes, new implementations), not by editing existing working code.

```
# VIOLATION — every new discount type requires editing this function
def calculate_discount(order, discount_type):
    if discount_type == "percentage":
        return order.total * 0.1
    elif discount_type == "fixed":
        return 5.00
    elif discount_type == "bogo":          # Added later
        return order.cheapest_item_price   # Modified existing code
    # Every new type = risk of breaking existing types

# COMPLIANT — new discounts are new implementations
class PercentageDiscount(DiscountStrategy):
    def calculate(self, order):
        return order.total * self.percentage

class FixedDiscount(DiscountStrategy):
    def calculate(self, order):
        return self.amount

class BuyOneGetOneFree(DiscountStrategy):     # Added without touching existing code
    def calculate(self, order):
        return order.cheapest_item_price
```

**When to relax:** If you have fewer than 3 variants and growth is unlikely, a simple conditional is fine. Don't create an abstraction hierarchy for 2 cases.

**Decision rule:** Are you adding a third `if/else` branch to the same decision point? Time to refactor to OCP.

---

### L — Liskov Substitution Principle (LSP)

**Rule:** Subtypes must be substitutable for their base types without breaking the program.

**What this means in practice:** If code works with a base type, it must also work correctly with any derived type. Derived types must honor the base type's contract.

```
# VIOLATION — subtype breaks the base type's contract
class Bird:
    def fly(self): ...

class Penguin(Bird):
    def fly(self):
        raise CannotFlyError()  # Breaks any code that expects all Birds to fly

# COMPLIANT — contract accurately reflects capability
class Bird:
    def move(self): ...

class Sparrow(Bird):
    def move(self):
        self.fly()

class Penguin(Bird):
    def move(self):
        self.walk()
```

```
# VIOLATION — subtype changes the expected behavior
class Collection:
    def add(self, item):
        """Adds item to the collection. Collection grows by 1."""
        self.items.append(item)

class UniqueCollection(Collection):
    def add(self, item):
        if item in self.items:
            return  # Silently does nothing — caller expects collection to grow!
```

**When to relax:** Rarely. LSP violations cause subtle bugs that appear far from the source. Always respect this principle.

**Decision rule:** Can you drop in the subtype everywhere the base type is used without any code changes? If not, you're violating LSP.

---

### I — Interface Segregation Principle (ISP)

**Rule:** No client should be forced to depend on methods it does not use.

**What this means in practice:** Create small, focused interfaces rather than large, monolithic ones.

```
# VIOLATION — forces implementors to provide methods they don't need
class Worker:
    def work(): ...
    def eat(): ...
    def sleep(): ...

class Robot(Worker):
    def work(self): ...
    def eat(self): raise NotApplicable()   # Robots don't eat
    def sleep(self): raise NotApplicable()  # Robots don't sleep

# COMPLIANT — small, focused interfaces
class Workable:
    def work(): ...

class Feedable:
    def eat(): ...

class Restable:
    def sleep(): ...

class Human(Workable, Feedable, Restable): ...
class Robot(Workable): ...  # Only implements what applies
```

**When to relax:** If all current and foreseeable implementors genuinely need all methods, a single interface is fine. Don't split a 3-method interface into 3 single-method interfaces for purity.

**Decision rule:** Does any implementor need to throw "not supported" for a method? Split the interface.

---

### D — Dependency Inversion Principle (DIP)

**Rule:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**What this means in practice:** Business logic defines the interfaces it needs. Infrastructure provides implementations.

```
# VIOLATION — business logic depends directly on infrastructure
class OrderService:
    def __init__(self):
        self.db = PostgresDatabase()      # High-level depends on low-level
        self.mailer = GmailClient()        # Locked into specific implementations

# COMPLIANT — business logic defines its own interfaces
class OrderService:
    def __init__(self, repo: OrderRepository, notifier: OrderNotifier):
        self.repo = repo                   # Depends on abstraction
        self.notifier = notifier           # Infrastructure decides implementation

# Infrastructure layer provides implementations
class PostgresOrderRepository(OrderRepository): ...
class EmailOrderNotifier(OrderNotifier): ...
```

**When to relax:** For genuinely stable dependencies that will never change (standard library, basic utilities), direct dependency is fine. Don't abstract `Math.round()`.

**Decision rule:** Could this dependency realistically change or need to be substituted for testing? If yes, invert it.

---

## Anti-Patterns

### 1. Speculative Generality
```
# ANTI-PATTERN — creating abstractions "just in case"
class IUserRepository: ...        # Only one implementation exists
class IUserService: ...           # Only one implementation exists
class IUserValidator: ...         # Only one implementation exists
class IUserMapper: ...            # Only one implementation exists
# 4 interfaces for 4 classes that will never have alternatives
```
**Rule:** Create abstractions when there are (or will imminently be) 2+ implementations, or when testing requires substitution.

### 2. SRP Taken to Extremes
```
# ANTI-PATTERN — responsibilities split too granularly
class UserNameSetter: ...
class UserEmailSetter: ...
class UserAgeSetter: ...
class UserSaver: ...
class UserLoader: ...
# 15 classes to manage one entity
```
**Rule:** SRP means one *reason to change*, not one *operation*. A `UserRepository` with CRUD methods has one reason to change: data access patterns.

### 3. Interface Bloat
```
# ANTI-PATTERN — interfaces for everything, even where unnecessary
class IStringFormatter: ...
class INumberAdder: ...
class IListSorter: ...
# Abstracting stable, trivial operations
```
**Rule:** Only abstract at architectural boundaries where substitution adds value.

---

## Decision Rules Summary

| Principle | Apply When                                           | Relax When                                    |
| --------- | ---------------------------------------------------- | --------------------------------------------- |
| SRP       | Class changes for 2+ unrelated reasons                | Simple CRUD with < 5 methods                  |
| OCP       | Adding 3rd+ variant to a decision point               | 1-2 variants with no expected growth           |
| LSP       | Always                                                | Rarely — violations cause subtle bugs          |
| ISP       | Implementors throw "not supported"                    | All implementors need all methods              |
| DIP       | Dependency could change or needs test substitution    | Dependency is trivially stable (stdlib, math)  |

---

## Quality Checklist

- [ ] Each class has one clear reason to change (SRP)
- [ ] New behavior is added through new code, not editing existing branches (OCP)
- [ ] All subtypes can replace their base types without breaking callers (LSP)
- [ ] No implementor throws "not applicable" for interface methods (ISP)
- [ ] Business logic depends on abstractions, not concrete infrastructure (DIP)
- [ ] Abstractions exist for a reason (substitution or testing), not speculation
- [ ] Principles are applied to manage complexity, not create it

---

## Common Mistakes

| Mistake                                    | Consequence                           | Fix                                       |
| ------------------------------------------ | ------------------------------------- | ----------------------------------------- |
| Creating interfaces for every class        | Unnecessary indirection               | Only abstract at boundaries               |
| Splitting classes too granularly            | Scattered logic, hard to follow       | Group by reason-to-change, not by method  |
| Ignoring LSP                               | Subtle bugs far from the source       | Ensure subtypes honor base contracts      |
| Applying DIP to stable dependencies        | Over-engineering                      | Only invert unstable dependencies         |
| Using SOLID as absolute rules              | Rigid, over-engineered code           | Apply pragmatically based on context      |

---

## Acceptance Criteria

SOLID application is acceptable when:

1. Each principle is applied because it solves a real problem, not for theoretical purity
2. The code is simpler to understand and change than it would be without the principle
3. Abstractions have (or will soon have) multiple implementations or testing substitutes
4. New features can be added with minimal modification to existing code
5. No principle creates more complexity than it eliminates
