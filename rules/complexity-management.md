# Complexity Management — KISS & YAGNI

## Purpose

Complexity is the primary enemy of software maintainability. Every line of code, every abstraction, every feature adds complexity that must be maintained forever. These rules govern how to keep systems as simple as possible while meeting real requirements. KISS (Keep It Simple, Stupid) and YAGNI (You Aren't Gonna Need It) are the primary weapons against accidental complexity.

---

## Rules

### 1. KISS — Prefer the Simplest Solution That Works — MUST

Between two correct solutions, always choose the simpler one. Simplicity is measured by how quickly a new developer can understand the code.

```
# OVER-ENGINEERED — abstract factory pattern for 2 types
class NotificationFactory:
    _registry = {}

    @classmethod
    def register(cls, type_name, creator):
        cls._registry[type_name] = creator

    @classmethod
    def create(cls, type_name, **kwargs):
        creator = cls._registry.get(type_name)
        if not creator:
            raise UnknownNotificationType(type_name)
        return creator(**kwargs)

NotificationFactory.register("email", EmailNotification)
NotificationFactory.register("sms", SmsNotification)

# SIMPLE — a function that does the same thing
def create_notification(type, **kwargs):
    if type == "email":
        return EmailNotification(**kwargs)
    elif type == "sms":
        return SmsNotification(**kwargs)
    raise UnknownNotificationType(type)
```

**Decision point:** The simple version is correct until you have 5+ types or need runtime registration. Don't upgrade before then.

### 2. YAGNI — Don't Build What You Don't Need Today — MUST

Only implement functionality when it is currently needed, not when you predict it might be needed.

```
# YAGNI VIOLATION — building for hypothetical futures
class UserService:
    def get_user(self, id, include_relations=False, cache_strategy=None,
                 read_replica=False, tenant_id=None, version=None):
        # Supports multi-tenancy, read replicas, versioning, caching...
        # None of which are currently used

# CORRECT — build only what's needed now
class UserService:
    def get_user(self, id):
        return self.repository.find(id)
```

**When you predict a future need:**
1. Write today's simple code so it's easy to extend later
2. Do NOT write the extension itself
3. Make a note in documentation if the anticipated direction is important

### 3. Complexity Budget — SHOULD

Every module has a finite complexity budget. Every abstraction, indirection, or clever technique spends from that budget. When the budget is exhausted, simplify before adding more.

```
# OVER BUDGET — too many abstractions for a simple operation
Result<Response<Maybe<UserDTO>>> get_user(
    Query<UserQuery<Validated<UserIdParam>>>
)

# WITHIN BUDGET — appropriate complexity for a CRUD operation
User get_user(UserId id)
```

**Complexity budget guidelines:**

| Complexity Indicator        | Healthy                    | Over Budget                    |
| --------------------------- | -------------------------- | ------------------------------ |
| Indirection levels          | 1-2 (e.g., service → repo)| 4+ levels to trace a call      |
| Generic type parameters     | 0-2                        | 3+ nested generics             |
| Configuration options       | 3-5 per component          | 15+ toggles and flags          |
| Inheritance depth           | 1-2 levels                 | 4+ levels deep                 |
| Dependencies per component  | 3-5                        | 8+                             |

### 4. Choose Boring Technology — SHOULD

Prefer proven, well-understood solutions over novel, clever ones. Boring technology has known failure modes.

```
# EXCITING BUT RISKY
"Let's use an eventually consistent event-sourced CQRS architecture
 with saga orchestration for our 3-page CRUD app"

# BORING BUT EFFECTIVE
"Let's use a relational database with a simple service layer"
```

**Criteria for choosing technology:**
- Does the team have experience with it?
- Is it well-documented with a large community?
- Are its failure modes well-understood?
- Can we hire for this skill?

### 5. Avoid Premature Optimization — MUST

Never optimize code for performance before measuring that it's actually slow.

```
# PREMATURE — complex caching before proving a performance problem
class UserService:
    def __init__(self):
        self.cache = LRUCache(max_size=10000)
        self.bloom_filter = BloomFilter(expected_elements=100000)

    def get_user(self, id):
        if self.bloom_filter.might_contain(id):
            cached = self.cache.get(id)
            if cached:
                return cached
        user = self.repo.find(id)
        self.cache.set(id, user)
        self.bloom_filter.add(id)
        return user

# CORRECT — simple first, optimize when measured
class UserService:
    def get_user(self, id):
        return self.repo.find(id)
    # Add caching ONLY when profiling shows this is a bottleneck
```

### 6. Prefer Composition Over Inheritance — SHOULD

Inheritance creates tight coupling and rigid hierarchies. Prefer composing behavior from small, focused components.

```
# PROBLEMATIC — deep inheritance hierarchy
class Animal: ...
class Bird(Animal): ...
class FlyingBird(Bird): ...
class Penguin(Bird): ...     # Can't fly but inherits from Bird
class Bat(Animal): ...       # Can fly but isn't a Bird

# BETTER — composition
class Animal:
    def __init__(self, movement: MovementStrategy, diet: DietStrategy):
        self.movement = movement
        self.diet = diet

penguin = Animal(movement=WalkAndSwim(), diet=Carnivore())
bat = Animal(movement=Fly(), diet=Insectivore())
```

**Inheritance is appropriate when:**
- There is a genuine "is-a" relationship
- The hierarchy is 2 levels or fewer
- Subtypes don't need to disable parent behavior

---

## The Simplicity Decision Framework

When choosing between approaches, score each on this scale:

| Factor                          | Score 1 (Simple)                | Score 5 (Complex)               |
| ------------------------------- | ------------------------------- | ------------------------------- |
| Lines of code                   | < 20                            | > 200                           |
| Number of abstractions          | 0-1                             | 5+                              |
| Time to understand              | < 1 minute                      | > 15 minutes                    |
| Dependencies introduced         | 0                               | 3+                              |
| Configuration required           | 0-1 values                      | 10+ configuration options       |
| Files created                    | 1                               | 5+                              |

**Choose the approach with the lowest total score that still meets requirements.**

---

## Anti-Patterns

### 1. Resume-Driven Development
Choosing technologies and patterns to make your resume look good rather than solving the actual problem.
**Symptom:** "Let's use microservices, Kubernetes, and event sourcing for our team of 3 building an internal tool."

### 2. Architecture Astronaut
Designing elaborate abstract architectures before understanding the actual problem.
**Symptom:** 10 layers of abstraction, 0 features delivered.

### 3. Golden Hammer
Using the same pattern/tool for every problem.
**Symptom:** "Everything should be an event." "Everything should be a microservice."

### 4. Speculative Generality
Building extension points for cases that never materialize.
**Symptom:** Plugin architecture with exactly one plugin — the one that ships.

### 5. Clever Code
Writing sophisticated one-liners or elegant patterns that nobody else can maintain.
**Symptom:** Code that makes the author look smart but makes everyone else confused.

---

## Decision Rules

1. **Is this abstraction earning its keep?** → Does it solve a real problem today, or is it "in case we need it"? If the latter, delete it.
2. **Can a junior developer understand this?** → If not, simplify. Your cleverest code is your most expensive code.
3. **How many files do I need to read to understand this feature?** → If > 5, the abstractions may be hurting more than helping.
4. **Am I solving a problem I actually have?** → Check with real data. If you can't point to a concrete requirement or measured bottleneck, stop.
5. **Will this be easier or harder to change in 6 months?** → Simpler code is almost always easier to change than clever abstractions.

---

## Quality Checklist

- [ ] No code exists for features that aren't currently needed (YAGNI)
- [ ] The simplest correct solution was chosen (KISS)
- [ ] No premature performance optimizations (profile first)
- [ ] Inheritance hierarchies are ≤ 2 levels deep
- [ ] Each abstraction solves a concrete, current problem
- [ ] No more than 5 files need to be read to understand any feature
- [ ] Configuration options are minimal and have sensible defaults
- [ ] Chosen technologies are well-understood by the team
- [ ] A junior developer can understand any module within 15 minutes
- [ ] No "just in case" extension points or plugin systems

---

## Common Mistakes

| Mistake                                | Consequence                            | Fix                                        |
| -------------------------------------- | -------------------------------------- | ------------------------------------------ |
| "We might need this later"             | Dead code, maintenance burden          | Delete it, build when actually needed      |
| Abstracting before the 2nd use case    | Premature abstraction, often wrong     | Wait for concrete evidence of reuse        |
| Choosing exciting over reliable         | Unknown failure modes in production    | Choose boring, proven technology           |
| Optimizing before profiling            | Wasted effort on non-bottlenecks       | Measure first, optimize the measured hot spot |
| Deep inheritance for code reuse        | Rigid hierarchies, fragile base class  | Use composition instead                    |

---

## Acceptance Criteria

Complexity management is acceptable when:

1. Every abstraction in the codebase solves a problem that exists today
2. A new developer can understand any module within 15 minutes of reading
3. Adding a new feature requires creating code, not understanding 10 layers of framework
4. The codebase has no "dead" extension points or unused configuration options
5. Performance optimizations exist only where profiling proved they were needed
