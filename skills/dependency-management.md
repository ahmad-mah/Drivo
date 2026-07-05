# Dependency Management

## Purpose

Every module in a system depends on other modules. How those dependencies are structured determines how flexible, testable, and maintainable the system is. This skill covers how to manage dependencies so that code remains loosely coupled, easily testable, and resilient to change.

---

## Core Principles

### 1. Depend on Abstractions, Not Concretions

Code should depend on interfaces (what something does) rather than implementations (how it does it).

```
# BAD — directly coupled to a specific implementation
class OrderService:
    def __init__(self):
        self.db = PostgresDatabase()  # Locked into Postgres forever

# GOOD — depends on an abstraction
class OrderService:
    def __init__(self, repository: OrderRepository):  # Any implementation works
        self.repository = repository
```

**Why:** You can swap PostgresOrderRepository for MongoOrderRepository or InMemoryOrderRepository without changing OrderService.

### 2. Inject Dependencies, Don't Create Them

A component should receive its dependencies from the outside, not construct them internally.

```
# BAD — creates its own dependency
class NotificationService:
    def __init__(self):
        self.emailer = SmtpEmailClient("smtp.gmail.com", 587)  # Hard-coded

# GOOD — receives dependency from outside
class NotificationService:
    def __init__(self, emailer: EmailClient):
        self.emailer = emailer  # Caller decides the implementation
```

### 3. Minimize Dependency Count

A component with too many dependencies is doing too much. This is a design smell.

```
# SMELL — too many dependencies signals too many responsibilities
class OrderProcessor:
    def __init__(self, user_repo, order_repo, payment_gateway,
                 inventory_service, email_service, logger,
                 tax_calculator, shipping_service, analytics):
        ...  # This class is doing everything

# BETTER — split into focused components
class OrderProcessor:
    def __init__(self, order_repo, payment_service, fulfillment_service):
        ...  # Each service handles its own subdependencies
```

**Guideline:** If a component has more than 3-5 dependencies, consider splitting it.

### 4. Dependency Direction Is Architecture

The direction of dependencies defines your architecture. Dependencies should always point from less stable (likely to change) to more stable (unlikely to change).

```
Stability spectrum:
  UI → Controllers → Services → Domain Models → Shared Kernel

  LEAST STABLE ──────────────────────────► MOST STABLE
  (changes often)                          (changes rarely)
```

Never let stable modules depend on unstable ones.

---

## Dependency Patterns

### Composition Root

Wire all dependencies together in one place, at the application's entry point.

```
# BAD — dependencies wired throughout the codebase
class UserService:
    def __init__(self):
        self.repo = UserRepository(PostgresDatabase(get_config()))
        self.emailer = EmailService(SmtpClient(get_config()))

# GOOD — all wiring happens at the composition root
def create_application():
    config = load_config()
    database = PostgresDatabase(config.db_url)
    smtp_client = SmtpClient(config.smtp_host)

    user_repo = UserRepository(database)
    email_service = EmailService(smtp_client)
    user_service = UserService(user_repo, email_service)

    return Application(user_service)
```

### Interface Segregation for Dependencies

Don't depend on large interfaces when you only need a small part.

```
# BAD — depends on entire repository with 20 methods
class ReportGenerator:
    def __init__(self, user_repo: UserRepository):
        # Only uses find_active_users(), but depends on everything
        self.user_repo = user_repo

# GOOD — depends only on what it needs
class ReportGenerator:
    def __init__(self, active_user_finder: ActiveUserFinder):
        self.active_user_finder = active_user_finder
```

### Facade Pattern for External Dependencies

Wrap external libraries behind your own interface so you can replace them.

```
# BAD — external library used directly throughout codebase
import third_party_http

class UserService:
    def get_user(self, id):
        response = third_party_http.get(f"/users/{id}")  # 200 call sites

# GOOD — wrapped behind your own interface
class HttpClient:  # Your interface
    def get(self, url): ...

class ThirdPartyHttpClient(HttpClient):  # Your adapter
    def get(self, url):
        return third_party_http.get(url)

class UserService:
    def __init__(self, http: HttpClient):
        self.http = http  # Can swap without changing UserService
```

---

## External Dependency Rules

### Before Adding a Dependency, Ask:

1. **Can I write this in < 50 lines?** → Write it yourself. Less risk, less maintenance.
2. **Is this dependency actively maintained?** → Check last commit date, issue response time, contributor count.
3. **How many transitive dependencies does it pull in?** → Prefer dependencies with minimal sub-dependencies.
4. **What's the blast radius if this breaks?** → Dependencies in your critical path need the highest scrutiny.
5. **Can I isolate it behind my own interface?** → Always wrap external dependencies.

### Dependency Health Indicators

| Indicator                    | Healthy                     | Unhealthy                           |
| ---------------------------- | --------------------------- | ----------------------------------- |
| Last update                  | Within 6 months             | Over 1 year ago                     |
| Open issues response         | Maintainer responds          | Hundreds of ignored issues          |
| Breaking changes frequency   | Rare, well-communicated     | Frequent, undocumented              |
| License                      | Clear, permissive           | Unclear or restrictive              |
| Transitive dependencies      | Few (< 5)                   | Dozens                              |

---

## Anti-Patterns

### 1. Service Locator
```
# ANTI-PATTERN — hidden dependency, impossible to test
class OrderService:
    def create_order(self, data):
        repo = ServiceLocator.get(OrderRepository)  # Where did this come from?
        repo.save(data)
```
**Fix:** Use constructor injection — dependencies are explicit.

### 2. Ambient Context / Global State
```
# ANTI-PATTERN — global mutable state
Database.connection = connect("production_db")

class UserService:
    def get_user(self, id):
        return Database.connection.find(id)  # Depends on global state
```
**Fix:** Pass the connection through constructor injection.

### 3. Diamond Dependency
```
# ANTI-PATTERN — two paths to the same dependency with different versions
A depends on B (v1.0) and C
C depends on B (v2.0)
# Which version of B gets used?
```
**Fix:** Align versions, or extract the shared dependency into a shared module.

### 4. Depending on Implementation Details of Dependencies
```
# ANTI-PATTERN
class ReportService:
    def generate(self):
        # Reaching into internal storage format of UserRepository
        raw_data = self.user_repo._cache._internal_dict
```
**Fix:** Use only the public API of your dependencies.

---

## Decision Rules

1. **Should I add this external package?** → Only if it solves a complex problem you can't reasonably implement in < 50 lines, and it passes the health indicators check.
2. **Should I inject this or create it?** → Inject it if it has behavior that might change or if you need to test the consumer in isolation.
3. **Where do I wire dependencies?** → At the composition root (application entry point). Nowhere else.
4. **My component has 7 dependencies — is that OK?** → No. It's doing too much. Split it into smaller, focused components.
5. **Should I wrap this external library?** → If you use it in more than one place, yes. The cost of wrapping is always less than the cost of replacing a leaky dependency later.

---

## Quality Checklist

- [ ] Dependencies are injected via constructor, not created internally
- [ ] All dependency wiring happens at the composition root
- [ ] No component has more than 5 direct dependencies
- [ ] External libraries are wrapped behind project-owned interfaces
- [ ] No circular dependencies exist between modules
- [ ] Dependencies point from unstable to stable modules
- [ ] No service locator or ambient context patterns
- [ ] External dependencies pass health indicators check before adoption
- [ ] Each dependency can be replaced without modifying its consumers
- [ ] No reaching into the private internals of dependencies

---

## Common Mistakes

| Mistake                               | Consequence                            | Fix                                        |
| ------------------------------------- | -------------------------------------- | ------------------------------------------ |
| Creating dependencies inside constructors | Untestable, tightly coupled        | Inject through constructor                 |
| Using a DI framework for everything   | Over-engineered, hard to trace wiring  | Manual wiring at composition root is fine  |
| Not wrapping external libraries       | Locked into specific vendor            | Create your own interface + adapter        |
| Too many constructor parameters       | Class has too many responsibilities    | Split the class, not the parameters        |
| Depending on concrete classes         | Can't substitute for testing/changes   | Depend on interfaces/abstractions          |

---

## Acceptance Criteria

Dependency management is acceptable when:

1. Any dependency can be replaced with an alternative implementation by changing only the composition root
2. Every component can be tested in isolation by injecting test doubles
3. Adding, removing, or updating an external library requires changes in at most 2-3 files
4. The dependency graph has no cycles
5. A new developer can trace where any dependency comes from by reading the composition root
