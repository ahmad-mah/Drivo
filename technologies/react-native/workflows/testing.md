# React Native Testing Workflow

## Base Workflow
Follow `skills/testing-strategy.md` for general testing principles. This document covers the React Native-specific testing process using Jest and React Native Testing Library (RNTL).

---

## Testing Flow

```
1. Setup/Mock Native Modules → 2. Unit Tests (Hooks/Utils) → 3. Component Tests (RNTL)
```

---

## Step 1: Mock Native Modules

Native modules (Camera, Storage, Reanimated) crash Jest because they expect a mobile environment, not Node.js.

Ensure your `jest.setup.js` contains mocks for all third-party native libraries used in the app.

```javascript
// Example jest.setup.js
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

---

## Step 2: Unit Tests (Hooks & Utils)

**Scope:** Pure functions, reducers, and custom hooks.

```bash
# Run tests for a specific file
npm test -- useAuth.test.ts
```

### Testing Custom Hooks

Use `renderHook` from `@testing-library/react-native`.

```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useCounter } from './useCounter';

test('increments counter', () => {
  const { result } = renderHook(() => useCounter());

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

---

## Step 3: Component Tests (RNTL)

**Scope:** User interactions, UI rendering, accessibility.

### Wrapper Setup

Create a `renderWithProviders` utility to wrap components in necessary Contexts (React Query, Navigation, Theme).

```tsx
// src/utils/test-utils.tsx
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

### Writing Component Tests

Always query by accessibility (Role/Text) to ensure your app works for screen readers.

```tsx
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/utils/test-utils';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('shows validation error when submitted empty', async () => {
    renderWithProviders(<LoginForm />);

    // Query by Role/Name
    const submitBtn = screen.getByRole('button', { name: /login/i });
    
    fireEvent.press(submitBtn);

    // Query by Text
    const errorMessage = await screen.findByText(/email is required/i);
    expect(errorMessage).toBeTruthy();
  });
});
```

---

## Quality Checklist

- [ ] All native modules are successfully mocked in `jest.setup.js` (no import crashes).
- [ ] Custom hooks are tested in isolation using `renderHook` and `act`.
- [ ] Component tests wrap the component with `renderWithProviders` if they use React Query, Navigation, or Theme.
- [ ] Component tests query elements by accessibility roles (`getByRole`) or text (`getByText`) rather than `testID` whenever possible.
- [ ] User interactions are simulated using `fireEvent` (or `userEvent`).
- [ ] Async state updates (like fetching data on mount) are awaited using `findBy...` or `waitFor`.
