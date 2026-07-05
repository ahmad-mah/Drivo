# Node.js Code Review Checklist

## Base Workflow
Follow `rules/code-review-standards.md` for general review process. This document adds Node.js/Express-specific review criteria.

---

## Node.js Review Checklist

### Architecture & Structure

- [ ] Controller methods contain NO business logic or direct database queries.
- [ ] Service methods contain NO HTTP objects (`req`, `res`).
- [ ] Routes are defined in dedicated router files, not directly on the `app` object (except for simple root endpoints).
- [ ] `import`/`export` (ES Modules) is used rather than `require`/`module.exports`.

### Async & Error Handling

- [ ] All database, file, and network operations use `await`.
- [ ] Independent async operations use `Promise.all` instead of running sequentially.
- [ ] Controller methods are wrapped in an async error catcher (`catchAsync`), or use `try/catch` calling `next(err)`.
- [ ] `next()` or a `res` method (`json`, `send`) is called in every possible code path of a middleware or controller.
- [ ] Execution stops (`return res...`) when sending an error response to avoid "Headers already sent" crashes.

### Types & Validation

- [ ] Incoming data (`req.body`, `req.query`, `req.params`) is validated using a schema library (Zod, Joi) via middleware.
- [ ] TypeScript `any` is not used.
- [ ] `req.body` is strictly typed in the controller (inferred from the validation schema).

### Security & Data Handling

- [ ] Passwords are never returned in API responses (check DTOs/Selects).
- [ ] Database queries are parameterized (ORM/Query Builder handles this automatically; flag raw SQL strings).
- [ ] Sensitive operations (password change, delete account) require re-authentication or strict token validation.
- [ ] Pagination (`limit`/`offset`) is implemented on all endpoints returning lists/arrays.

---

## Red Flags (Blocking Issues)

| Red Flag                                    | Why It Blocks                             |
| ------------------------------------------- | ----------------------------------------- |
| Synchronous standard library methods        | E.g., `fs.readFileSync` blocks the single thread for all users. |
| Unhandled Promises (missing await/catch)    | Will crash the Node.js process. |
| Raw SQL string concatenation                | Vulnerable to SQL Injection. |
| Passing `req` into a Service                | Destroys separation of concerns; Service can't be unit tested easily. |
| Returning raw database errors to client     | Leaks schema information to potential attackers. |
| Missing `next()` in middleware              | The client request will hang indefinitely. |

---

## Green Flags (Praise-Worthy)

| Green Flag                                  | Why It's Good                             |
| ------------------------------------------- | ----------------------------------------- |
| Custom Error Classes (`NotFoundError`)      | Keeps controllers clean and centralizes HTTP status code logic. |
| Zod inference for `req.body` types          | Single source of truth for runtime validation and compile-time types. |
| Constructor Dependency Injection            | Makes services highly testable with mocks. |
| Transactions for multi-step DB writes       | Prevents orphaned/corrupted data on failure. |
