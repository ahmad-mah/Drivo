# Node.js & Express Workflows

## Purpose

Node.js-specific workflows that extend the generic engineering workflows. These workflows cover the complete lifecycle of backend development, from database migrations and API creation to testing and Docker deployment.

## Directory Structure

```
node-express/workflows/
├── README.md                     # This file
├── feature-development.md        # Building an API endpoint end-to-end
├── bug-fixing.md                 # Debugging memory leaks and crashes
├── refactoring.md                # Moving logic to services, DRYing routes
├── review.md                     # Node-specific code review checklist
├── testing.md                    # Unit (Jest) and E2E (Supertest) testing
├── deployment.md                 # Dockerizing and CI/CD
└── documentation.md              # OpenAPI/Swagger and TSDoc
```

## Relationship to Generic Workflows

These workflows ADD Node.js-specific steps to the generic workflows in `workflows/`. Follow the generic workflow as the base, then apply the Node-specific additions from this directory.

```
Generic workflow (workflows/feature-development.md)
  + Node additions (node-express/workflows/feature-development.md)
  = Complete Node.js workflow
```
