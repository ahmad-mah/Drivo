---
name: api-design
description: Use when designing REST API endpoints, request/response schemas, error formats, and versioning strategies.
---

# Skill: API Design

This skill provides conventions for designing consistent, robust, and self-documenting REST APIs.

## Rules
1. **Resource-Oriented URLs**: Use plural nouns for resources: `GET /api/expenses`, `POST /api/expenses`, `GET /api/expenses/:id`. Avoid verbs in URLs (use `POST /api/payments` not `POST /api/createPayment`).
2. **Consistent Error Schema**: Return errors in a consistent format:
   ```json
   { "error": { "code": "VALIDATION_ERROR", "message": "Description", "details": [...] } }
   ```
3. **Versioning via URL Prefix**: Use `/api/v1/`, `/api/v2/` for major version changes. Avoid header-based versioning.
4. **Pagination**: For list endpoints, require `page` (1-indexed) and `limit` query params. Include `total`, `page`, `limit`, `totalPages` in the response envelope.
5. **Status Codes**: Use correct HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error).

## Workflow
1. **Define Resource Model**: Create the OpenAPI schema or TypeScript type for the resource.
2. **Define Endpoints**: Map out CRUD + any custom actions for each resource.
3. **Add Validation**: Apply request validation using zod or class-validator.
4. **Implement Controller**: Wire to service layer.
5. **Document**: Write OpenAPI spec or update existing docs with new endpoints.

## Checklists
- [ ] Endpoint URLs follow resource-oriented conventions.
- [ ] Error responses follow consistent schema across all endpoints.
- [ ] Pagination is implemented for all list endpoints.
- [ ] Input validation is applied (400/422 for invalid requests).
- [ ] OpenAPI spec or equivalent documentation is up-to-date.

## Common Mistakes
- **Inconsistent Error Formats**: Some endpoints return `{error: string}`, others return `{message: string}`, making client-side error handling fragile.
- **Over-fetching / Under-fetching**: Returning full entity objects for list endpoints when only IDs and names are needed. Use field selection or separate list DTOs.
- **No Rate-Limiting Headers**: Not returning `X-RateLimit-Remaining` headers, making it impossible for clients to back off gracefully.

## Validation Steps
1. Validate OpenAPI spec with `redocly lint` or `spectral`.
2. Verify all endpoints return proper status codes and error shapes.
3. Ensure pagination works correctly with edge cases (page 0, negative limit).
