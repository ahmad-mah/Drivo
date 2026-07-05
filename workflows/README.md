# Engineering Workflows

## Purpose

This directory contains **step-by-step engineering workflows** — the processes and sequences that guide how work gets done. Unlike skills (how to do things) and rules (what to enforce), workflows define **when** to do things and **in what order**.

Each workflow is a repeatable process that produces consistent, high-quality results regardless of who follows it.

## Directory Structure

```
workflows/
├── README.md                     # This file — purpose and overview
├── feature-development.md        # Building new features end-to-end
├── bug-investigation.md          # Systematic debugging process
├── refactoring.md                # Safe refactoring workflow
├── technical-debt.md             # Identifying and managing tech debt
└── decision-making.md            # Architecture and technology decision process
```

## How to Use These Workflows

1. **Before starting work**, identify which workflow applies to your task.
2. **During execution**, follow the steps in order — each step has clear entry and exit criteria.
3. **When stuck**, the decision rules in each workflow guide the next action.
4. **After completion**, use the acceptance criteria to verify the work is done.

## Workflow Selection Guide

| Task Type                                | Workflow to Follow                |
| ---------------------------------------- | --------------------------------- |
| Building a new feature                   | `feature-development.md`          |
| Fixing a reported bug                    | `bug-investigation.md`            |
| Improving existing code structure        | `refactoring.md`                  |
| Addressing accumulated tech debt         | `technical-debt.md`               |
| Making a technical or architecture choice| `decision-making.md`              |

## Relationship to Other Directories

| Directory    | Contains              | Answers           |
| ------------ | --------------------- | ----------------- |
| `skills/`    | Techniques & patterns | **How** to do it  |
| `rules/`     | Principles & standards| **What** to enforce|
| `workflows/` | Processes & sequences | **When** to do it |
