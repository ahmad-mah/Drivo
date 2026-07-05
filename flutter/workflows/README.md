# Flutter Workflows

## Purpose

Flutter-specific workflows that extend the generic engineering workflows. These workflows cover the complete lifecycle of Flutter development from feature building through deployment.

## Directory Structure

```
flutter/workflows/
├── README.md                     # This file
├── feature-development.md        # Building Flutter features
├── bug-fixing.md                 # Flutter-specific debugging
├── refactoring.md                # Flutter refactoring patterns
├── review.md                     # Flutter code review checklist
├── testing.md                    # Flutter testing workflow
├── deployment.md                 # Build, sign, and deploy
└── documentation.md              # Flutter documentation standards
```

## Relationship to Generic Workflows

These workflows ADD Flutter-specific steps to the generic workflows in `workflows/`. Follow the generic workflow as the base, then apply the Flutter-specific additions from this directory.

```
Generic workflow (workflows/feature-development.md)
  + Flutter additions (flutter/workflows/feature-development.md)
  = Complete Flutter workflow
```
