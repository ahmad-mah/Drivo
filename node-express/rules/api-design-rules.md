# API Design Rules

## Purpose

Rules for designing and structuring RESTful APIs in Express. These ensure predictability, consistency, and alignment with industry standards.

---

## RESTful Principles — MUST

### 1. Naming Resource URLs

URLs must be nouns (representing resources), not verbs (actions). Use standard HTTP methods (GET, POST, PUT, PATCH, DELETE) for actions.

```
# VIOLATIONS
POST /api/users/createNewUser
GET /api/users/getUserById/123
POST /api/users/123/update

# CORRECT
POST /api/users         (Create user)
GET /api/users/123      (Get user by ID)
PATCH /api/users/123    (Update user)
DELETE /api/users/123   (Delete user)
```

### 2. Nested Resources

If a resource belongs to another resource, reflect that in the URL. Keep nesting to a maximum of one level deep.

```
# CORRECT
GET /api/users/123/orders       (Get orders for user 123)
POST /api/users/123/orders      (Create an order for user 123)

# VIOLATION (Too deep)
GET /api/users/123/orders/456/items/789
```

---

## HTTP Status Codes — MUST

Always use the correct HTTP status code for the situation.

| Code | Meaning | When to use |
| --- | --- | --- |
| **200** | OK | Successful GET, PUT, PATCH, DELETE. |
| **201** | Created | Successful POST (resource was created). |
| **204** | No Content | Successful DELETE (if returning no body). |
| **400** | Bad Request | Client sent invalid data (failed validation). |
| **401** | Unauthorized | Client is not authenticated (missing/invalid token). |
| **403** | Forbidden | Client is authenticated but lacks permission (role check failed). |
| **404** | Not Found | The requested resource (e.g., ID) does not exist. |
| **429** | Too Many Requests | Rate limit exceeded. |
| **500** | Internal Error | Server crashed or database failed (hide details from client). |

---

## Response Formatting — SHOULD

### 3. Consistent JSON Wrapper

All API responses should follow a predictable wrapper format to make frontend parsing easier. Do not return raw arrays or strings.

```json
// Success Response (e.g., 200 OK)
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Alice"
  }
}

// Error Response (e.g., 400 Bad Request)
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 4. Pagination Metadata

For endpoints that return lists, always include pagination metadata.

```json
{
  "success": true,
  "data": [ ...items... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## Request Handling — MUST

### 5. Extracting Data

Follow conventions for where data lives in the request:
- **`req.body`**: Data for creating or updating resources (POST/PUT/PATCH).
- **`req.params`**: Identifiers for a specific resource (e.g., `/:id`).
- **`req.query`**: Modifiers for list endpoints (filtering, sorting, pagination).

```typescript
// GET /api/users?role=admin&page=2
const { role, page } = req.query;

// PATCH /api/users/123
const { id } = req.params;
const { name } = req.body;
```

---

## Quality Checklist

- [ ] Routes use nouns, not verbs (`/users` instead of `/getUsers`).
- [ ] Appropriate HTTP methods are used (GET for reading, POST for creation, PATCH for partial updates, DELETE for removal).
- [ ] Correct HTTP status codes are returned (201 for POST, 400 for validation errors, 404 for missing resources).
- [ ] Responses use a consistent JSON wrapper (`{ success, data }` or `{ success, error }`).
- [ ] List endpoints support pagination via `req.query` (`?limit=10&page=1`) and include pagination metadata in the response.
