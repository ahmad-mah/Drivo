# Error Handling

## Purpose

Error handling determines how software behaves when things go wrong. Poor error handling hides bugs, corrupts data, and produces unhelpful diagnostics. This skill covers how to handle errors in a way that is predictable, informative, and recoverable.

---

## Core Principles

### 1. Fail Fast, Fail Loud

Detect errors as early as possible and surface them immediately. Silent failures are the most dangerous kind — they allow corrupted state to propagate.

```
# BAD — silent failure, caller never knows something went wrong
def get_user(id):
    try:
        return database.find(id)
    except:
        return None  # caller assumes success

# GOOD — fail explicitly so the caller can react
def get_user(id):
    user = database.find(id)
    if user is None:
        raise UserNotFoundError(f"No user found with id: {id}")
    return user
```

### 2. Handle Errors at the Right Level

An error should be handled by the layer that has enough context to make a meaningful decision.

```
# BAD — low-level code making UI decisions
def save_to_database(record):
    try:
        database.insert(record)
    except DatabaseError:
        show_error_dialog("Save failed!")  # Not this layer's job

# GOOD — propagate up to the layer that owns the response
def save_to_database(record):
    try:
        database.insert(record)
    except DatabaseError as e:
        raise PersistenceError("Failed to save record", cause=e)

# The UI/controller layer catches PersistenceError and decides how to inform the user
```

### 3. Distinguish Error Categories

Not all errors are equal. Handle each category differently:

| Category            | Description                          | Response Strategy              |
| ------------------- | ------------------------------------ | ------------------------------ |
| **Input errors**    | Invalid user input or API request    | Validate early, return clear message |
| **Business errors** | Valid input but violates rules       | Return domain-specific error   |
| **System errors**   | Infrastructure failure (DB, network) | Retry, fallback, or escalate   |
| **Programming errors** | Bugs (null ref, index out of bounds) | Crash immediately, fix the bug |

### 4. Never Swallow Exceptions

Every caught error must result in one of:
- **Handling** — taking corrective action
- **Wrapping** — adding context and re-raising
- **Logging** — recording for diagnosis (only if truly non-critical)

```
# ANTI-PATTERN — swallowed exception
try:
    process_payment(order)
except:
    pass  # What happened? Nobody knows.

# CORRECT — handle, wrap, or log
try:
    process_payment(order)
except PaymentDeclinedError as e:
    notify_user_payment_declined(order, e)   # Handle
except PaymentGatewayError as e:
    raise ServiceUnavailableError("Payment service down", cause=e)  # Wrap
except Exception as e:
    logger.error("Unexpected payment error", error=e, order_id=order.id)  # Log
    raise  # Still propagate
```

---

## Error Design Patterns

### Domain-Specific Error Types

Create error types that map to your domain, not to technical details.

```
# BAD — generic errors leak implementation details
raise Exception("SQL constraint violation: unique_email")

# GOOD — domain errors communicate business meaning
raise DuplicateEmailError(email=user.email)
```

### Error Context Chain

When wrapping errors, preserve the original cause for debugging while providing higher-level context.

```
# Each layer adds context
NetworkLayer:   ConnectionTimeoutError("Host unreachable: api.payments.com")
ServiceLayer:   PaymentServiceError("Failed to process payment", cause=timeout_error)
ControllerLayer: OrderCreationError("Could not complete order #1234", cause=service_error)
```

### Result Pattern (Alternative to Exceptions)

For expected failure cases, consider returning a result type instead of throwing.

```
# Using a Result type
def divide(a, b):
    if b == 0:
        return Result.failure("Division by zero")
    return Result.success(a / b)

# Caller explicitly handles both cases
result = divide(10, 0)
if result.is_success:
    use(result.value)
else:
    log(result.error)
```

### Validation at Boundaries

Validate all external input at system boundaries. Internal code should be able to trust the data it receives.

```
# BOUNDARY — validate everything
def create_user_endpoint(request):
    errors = validate_create_user_request(request)
    if errors:
        return error_response(400, errors)
    # Past this point, data is trusted
    user = user_service.create(request.to_domain())
    return success_response(user)

# INTERNAL — no redundant validation needed
def create(validated_user_data):
    return repository.save(validated_user_data)
```

---

## Anti-Patterns

### 1. Pokemon Exception Handling ("Gotta Catch 'Em All")
```
# ANTI-PATTERN — catches everything, handles nothing
try:
    complex_operation()
except Exception:
    return default_value
```

### 2. Error Codes Instead of Types
```
# ANTI-PATTERN — magic numbers for error states
result = process(data)
if result == -1:  # What does -1 mean?
    handle_error()

# BETTER — use typed errors or enums with clear names
```

### 3. Boolean Error Returns
```
# ANTI-PATTERN — loses all error context
def save_user(user):
    try:
        database.save(user)
        return True
    except:
        return False  # Why did it fail? Unknown.
```

### 4. Error Messages for Developers in User-Facing Output
```
# ANTI-PATTERN
"NullPointerException at UserService.java:42"

# CORRECT — separate user message from diagnostic info
User message: "We couldn't load your profile. Please try again."
Log message:  "NullPointerException at UserService.java:42, user_id=abc123"
```

### 5. Using Errors for Control Flow
```
# ANTI-PATTERN — exceptions as goto statements
try:
    user = find_user(email)
except UserNotFoundError:
    user = create_user(email)  # This is normal flow, not an error

# BETTER — check existence explicitly
if user_exists(email):
    user = find_user(email)
else:
    user = create_user(email)
```

---

## Decision Rules

1. **Is this an expected case?** → Use result types or conditional checks, not exceptions.
2. **Can this layer handle the error meaningfully?** → If yes, handle it. If no, propagate it.
3. **Is the error recoverable?** → If yes, implement retry/fallback. If no, fail fast with good diagnostics.
4. **Is this a programming error (bug)?** → Don't catch it. Let it crash. Fix the code.
5. **Should the user see this error?** → If yes, write a human-friendly message. Log the technical details separately.

---

## Quality Checklist

- [ ] No empty catch blocks anywhere in the codebase
- [ ] All external input is validated at system boundaries
- [ ] Error types are domain-specific, not generic
- [ ] Error messages include enough context for diagnosis (who, what, why)
- [ ] User-facing error messages are human-readable and actionable
- [ ] Original error causes are preserved when wrapping
- [ ] Retry logic has maximum attempts and exponential backoff
- [ ] Timeouts are set on all external calls (network, database, file I/O)
- [ ] Errors are logged with structured data (not just string messages)
- [ ] Critical errors trigger alerts, not just log entries

---

## Common Mistakes

| Mistake                           | Consequence                              | Fix                                        |
| --------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Catching all exceptions broadly   | Hides bugs and unexpected failures       | Catch specific types                       |
| Logging and re-throwing same error| Duplicate log entries, noise             | Log OR re-throw, not both                  |
| No timeout on external calls      | Thread/process hangs indefinitely        | Always set timeouts                        |
| Returning null to indicate error  | Caller gets NullPointerException later   | Use result types or throw                  |
| Inconsistent error response format| Clients can't reliably parse errors      | Standardize error response structure       |

---

## Acceptance Criteria

Error handling is acceptable when:

1. Every failure mode has a defined response (handle, propagate, or log)
2. A developer can diagnose any error from the logs alone, without reproducing it
3. Users never see stack traces, internal IDs, or technical jargon
4. No error is silently swallowed
5. The system degrades gracefully under partial failure (no cascading crashes)
