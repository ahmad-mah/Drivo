# React Native Workflows

## Purpose

React Native-specific workflows that extend the generic engineering workflows. These workflows cover the complete lifecycle of React Native development from feature building through deployment using Expo.

## Directory Structure

```
react-native/workflows/
├── README.md                     # This file
├── feature-development.md        # Building RN features (Component + Hooks approach)
├── bug-fixing.md                 # RN-specific debugging (Flipper/React DevTools)
├── refactoring.md                # Extracting hooks and components
├── review.md                     # RN code review checklist
├── testing.md                    # RN testing workflow
├── deployment.md                 # Expo EAS Build & Submit
└── documentation.md              # RN documentation standards
```

## Relationship to Generic Workflows

These workflows ADD React Native-specific steps to the generic workflows in `workflows/`. Follow the generic workflow as the base, then apply the React Native-specific additions from this directory.

```
Generic workflow (workflows/feature-development.md)
  + React Native additions (react-native/workflows/feature-development.md)
  = Complete React Native workflow
```
