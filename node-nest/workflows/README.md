# NestJS Workflows

## Purpose

NestJS-specific workflows that extend the generic engineering workflows. These workflows cover the complete lifecycle of backend development, from generating feature modules to testing and deploying.

## Directory Structure

```
node-nest/workflows/
├── README.md                     # This file
├── feature-development.md        # Generating modules and building endpoints
├── bug-fixing.md                 # Debugging DI issues and pipeline failures
├── refactoring.md                # Extracting providers, cleaning up modules
├── review.md                     # NestJS-specific code review checklist
├── testing.md                    # Jest unit and E2E testing
├── deployment.md                 # Dockerizing and Nest CLI builds
└── documentation.md              # OpenAPI/Swagger automation
```

## Relationship to Generic Workflows

These workflows ADD NestJS-specific steps to the generic workflows in `workflows/`. Follow the generic workflow as the base, then apply the Nest-specific additions from this directory.

```
Generic workflow (workflows/feature-development.md)
  + Nest additions (node-nest/workflows/feature-development.md)
  = Complete NestJS workflow
```
