# React Native Documentation Workflow

## Base Workflow
Follow `skills/documentation.md` for general documentation principles. This document adds React Native and TypeScript specific documentation standards.

---

## Documentation Flow

```
1. Type Level Docs (TSDoc) → 2. Architectural Docs (ADRs) → 3. Project Docs (README)
```

---

## Step 1: Type-Level Documentation (TSDoc)

TypeScript uses `/** */` for documentation comments. These are parsed by VSCode to provide hover text.

### Documenting Component Props

Always document your `interface` or `type` definitions for components. This is the most crucial documentation in React.

```tsx
/**
 * Props for the PrimaryButton component.
 */
export interface PrimaryButtonProps {
  /**
   * The text displayed inside the button.
   */
  label: string;

  /**
   * Called when the user presses the button.
   * Will not be called if `isLoading` or `disabled` is true.
   */
  onPress: () => void;

  /**
   * Shows a spinner and disables interactions when true.
   * @default false
   */
  isLoading?: boolean;
}

export const PrimaryButton = ({ label, onPress, isLoading = false }: PrimaryButtonProps) => { ... }
```

### Documenting Custom Hooks

Document what the hook manages and what it returns.

```tsx
/**
 * Custom hook to manage the authenticated user's session.
 * 
 * Fetches the user from secure storage on mount. Use this to protect
 * routes or fetch user-specific data.
 * 
 * @returns Object containing the user data and loading state.
 */
export const useAuth = () => { ... }
```

---

## Step 2: Architectural Documentation (ADRs)

For React Native projects, Architecture Decision Records (ADRs) are crucial for tracking why certain packages or patterns were chosen.

### Common React Native ADR Topics:
- **State Management:** Why Zustand over Redux Toolkit?
- **Routing:** Why Expo Router over bare React Navigation?
- **Styling:** Why NativeWind over StyleSheet or Styled Components?
- **Data Fetching:** Why React Query over Apollo or SWR?
- **Animation:** Why Reanimated over React Native's Animated API?

*See `workflows/decision-making.md` for the ADR template.*

---

## Step 3: Project Documentation (README.md)

An Expo / React Native project's root `README.md` must contain specific setup instructions.

### Required README Sections

1. **Prerequisites:**
   - Node.js version (e.g., `v18+`)
   - EAS CLI (if using Expo Application Services)
   - iOS Simulator / Android Studio setup links

2. **Getting Started:**
   ```bash
   # Clone the repo
   git clone ...

   # Install dependencies
   npm install

   # Start the Expo development server
   npx expo start
   ```

3. **Running Dev Clients (Native Code):**
   If the project uses custom native code (not just Expo Go):
   ```bash
   # Prebuild and run on iOS
   npx expo run:ios

   # Prebuild and run on Android
   npx expo run:android
   ```

4. **Environment Variables (.env):**
   Document which environment variables are required to run the app (e.g., API keys, Supabase URLs). Provide a `.env.example` file.

5. **Folder Structure:**
   A brief description of the `app/` vs `src/features/` architecture.

---

## Quality Checklist

- [ ] All exported interfaces/types for component props have `/** */` TSDoc comments.
- [ ] Custom hooks are documented explaining their purpose and return values.
- [ ] `README.md` includes explicit instructions for starting the dev server (`npx expo start`) vs running dev clients (`run:ios`).
- [ ] `README.md` lists required environment variables.
- [ ] Major technical choices (Zustand, React Query, Expo Router) are documented in ADRs.
- [ ] No generic `//` comments are used where TSDoc `/** */` should be used for public APIs.
