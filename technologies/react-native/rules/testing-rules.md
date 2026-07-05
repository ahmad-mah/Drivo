# React Native Testing Rules

## Purpose

React Native-specific testing standards covering unit tests and component tests. Extends the generic `skills/testing-strategy.md` with React Native and Expo conventions.

---

## Toolchain

- **Test Runner:** Jest
- **Component Testing:** `@testing-library/react-native` (RNTL)
- **Mocking:** Jest built-in mocking (`jest.mock`)

---

## Component Test Rules (RNTL)

### 1. Test Behavior, Not Implementation

Do not test internal state or specific child component structures. Test what the user sees and interacts with.

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';

// BAD — testing implementation details (state, child existence)
test('toggles state', () => {
  const wrapper = render(<Toggle />);
  // Don't test internal state like this (Enzyme style is dead)
  expect(wrapper.state('isOn')).toBe(false); 
});

// GOOD — testing behavior
test('toggles visual state on press', () => {
  render(<Toggle />);
  
  const button = screen.getByRole('switch');
  expect(button).toHaveProp('accessibilityState', { checked: false });
  
  fireEvent.press(button);
  
  expect(button).toHaveProp('accessibilityState', { checked: true });
});
```

### 2. Use Accessibility Queries First

Prefer querying by accessibility attributes (roles, labels) over `testID`. This ensures your app is accessible AND testable.

```tsx
// 1. BEST: Query by accessible role/label
screen.getByRole('button', { name: /submit/i });

// 2. GOOD: Query by text (for text elements)
screen.getByText('Submit Order');

// 3. OKAY: Query by placeholder
screen.getByPlaceholderText('Enter email');

// 4. LAST RESORT: Query by testID (for elements with no accessible meaning)
screen.getByTestId('decorative-icon');
```

### 3. Wrap Components with Necessary Providers

Components that rely on React Query, Navigation, or Theme contexts will crash if tested in isolation. Create a custom `render` function that wraps components in necessary providers.

```tsx
// test-utils.tsx
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Use this in your tests
import { renderWithProviders } from '@/utils/test-utils';
```

---

## Unit Test Rules (Jest)

### 1. Test Custom Hooks in Isolation

Use `@testing-library/react-hooks` or the built-in `renderHook` from RNTL to test custom hooks without needing a dummy component.

```tsx
import { renderHook, act } from '@testing-library/react-native';

test('useCounter increments correctly', () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);

  // Use act() when state is updated outside of React's call stack
  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### 2. Mocking Native Modules

React Native code often relies on native modules (like Camera, Location, Storage) which don't exist in the Node.js environment where Jest runs.

**Rule:** Mock native modules globally in a `jest.setup.js` file.

```javascript
// jest.setup.js
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 0, longitude: 0 }
  })),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

// Provide mock for async-storage
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
```

---

## Quality Checklist

- [ ] Component tests query by accessibility roles/text before falling back to `testID`.
- [ ] Tests verify user-observable behavior, not internal component state or structural JSX.
- [ ] Global contexts (Query, Theme) are provided to tests via a custom `render` wrapper.
- [ ] Custom hooks are tested directly using `renderHook`.
- [ ] State updates in tests are wrapped in `act(...)` to prevent React warnings.
- [ ] Native modules (Expo APIs, Storage) are mocked in `jest.setup.js` to prevent environment crashes.
