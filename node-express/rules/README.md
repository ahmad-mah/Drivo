# Node.js & Express Rules

## Purpose

Node.js-specific rules and standards that extend the generic engineering framework. These rules cover Node.js execution patterns, Express API design, project structure, security, and performance.

## Directory Structure

```
node-express/rules/
├── README.md                 # This file — purpose and overview
├── node-idioms.md            # Modern Node.js and TS language rules
├── api-design-rules.md       # RESTful API design constraints
├── project-structure.md      # Layered architecture constraints
├── security-rules.md         # Hardening Express apps
└── performance-rules.md      # Event loop and memory optimization
```

## Rule Priority

When generic engineering rules conflict with Node/Express-specific rules, **Node/Express rules take precedence**. Node.js's single-threaded event loop and non-blocking I/O model require specific framework rules that override general-purpose synchronous advice.

## Always-Loaded Rules

These rules should be loaded for **every** Node.js task:
1. `node-idioms.md` — Async/await, Promise handling, TS strictness
2. `project-structure.md` — Layered file organization
3. `security-rules.md` — Input validation and headers
