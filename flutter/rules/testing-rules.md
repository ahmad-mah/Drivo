# Flutter Testing Rules

## Purpose

Flutter-specific testing standards covering widget tests, integration tests, and golden tests. Extends the generic `skills/testing-strategy.md` with Flutter conventions.

---

## Test Types in Flutter

| Type              | Speed     | What It Tests                        | Tool                          |
| ----------------- | --------- | ------------------------------------ | ----------------------------- |
| **Unit**          | < 10ms    | Business logic, models, utilities    | `test` package                |
| **Widget**        | < 100ms   | Single widget behavior and rendering | `flutter_test`                |
| **Integration**   | < 30s     | Full app flows with real rendering   | `integration_test`            |
| **Golden**        | < 1s      | Visual appearance (screenshot diff)  | `flutter_test` + golden files |

---

## Unit Test Rules

### Test Business Logic Without Flutter

```dart
// Domain logic is pure Dart — test without Flutter framework
// test/features/orders/domain/usecases/calculate_total_test.dart

void main() {
  group('CalculateTotalUseCase', () {
    late CalculateTotalUseCase useCase;

    setUp(() {
      useCase = CalculateTotalUseCase();
    });

    test('returns zero for empty order', () {
      final result = useCase(const Order(items: []));
      expect(result, equals(Money.zero));
    });

    test('sums item prices correctly', () {
      final order = Order(items: [
        OrderItem(name: 'Widget', price: Money(10.00)),
        OrderItem(name: 'Gadget', price: Money(25.50)),
      ]);
      expect(useCase(order), equals(Money(35.50)));
    });

    test('applies tax after discount', () {
      final order = Order(
        items: [OrderItem(name: 'Item', price: Money(100.00))],
        discount: Discount.percentage(10),
      );
      final result = useCase(order, taxRate: 0.08);
      // 100 - 10% = 90, + 8% tax = 97.20
      expect(result, equals(Money(97.20)));
    });
  });
}
```

---

## Widget Test Rules

### 1. Test Behavior, Not Rendering Details

```dart
// BAD — testing widget tree structure (fragile)
testWidgets('login form renders correctly', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: LoginForm()));
  expect(find.byType(TextField), findsNWidgets(2));
  expect(find.byType(ElevatedButton), findsOneWidget);
  // Breaks if you change from ElevatedButton to FilledButton
});

// GOOD — testing behavior
testWidgets('login form shows error on invalid email', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: LoginForm()));

  // Enter invalid email
  await tester.enterText(find.byKey(const Key('emailField')), 'not-an-email');
  await tester.tap(find.byKey(const Key('loginButton')));
  await tester.pumpAndSettle();

  // Verify error is shown
  expect(find.text('Please enter a valid email'), findsOneWidget);
});
```

### 2. Use `pumpWidget` Correctly

```dart
testWidgets('shows loading then data', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: ChangeNotifierProvider(
        create: (_) => OrdersNotifier(MockOrderRepository()),
        child: const OrdersScreen(),
      ),
    ),
  );

  // Initial state — loading
  expect(find.byType(CircularProgressIndicator), findsOneWidget);

  // After async operations complete
  await tester.pumpAndSettle(); // Waits for all animations and futures

  // Loaded state
  expect(find.byType(OrderCard), findsNWidgets(3));
});

// pump() vs pumpAndSettle()
// pump()          → advances one frame (use for controlled stepping)
// pumpAndSettle() → advances until no more frames needed (use for final state)
// pump(Duration)  → advances a specific duration (use for animations)
```

### 3. Use Keys for Finding Widgets in Tests

```dart
// In the widget
TextField(
  key: const Key('emailField'), // Stable test anchor
  decoration: const InputDecoration(labelText: 'Email'),
)

// In the test
await tester.enterText(find.byKey(const Key('emailField')), 'test@email.com');

// PREFER Key-based finders over text-based (text changes with localization)
// PREFER Key-based finders over type-based (multiple widgets of same type)
```

### 4. Wrap Widgets with Required Ancestors

```dart
// Widgets using Theme, MediaQuery, Navigator, etc. need MaterialApp
Widget buildTestWidget(Widget child) {
  return MaterialApp(
    home: Scaffold(body: child),
  );
}

// Widgets using state management need providers
Widget buildTestWidgetWithState(Widget child) {
  return MaterialApp(
    home: ChangeNotifierProvider(
      create: (_) => MockAuthNotifier(),
      child: Scaffold(body: child),
    ),
  );
}
```

---

## Integration Test Rules

```dart
// integration_test/app_test.dart
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('complete order flow', (tester) async {
    await tester.pumpWidget(const MyApp());
    await tester.pumpAndSettle();

    // Login
    await tester.enterText(find.byKey(const Key('emailField')), 'test@test.com');
    await tester.enterText(find.byKey(const Key('passwordField')), 'password');
    await tester.tap(find.byKey(const Key('loginButton')));
    await tester.pumpAndSettle();

    // Navigate to orders
    await tester.tap(find.text('Orders'));
    await tester.pumpAndSettle();

    // Create order
    await tester.tap(find.byKey(const Key('createOrderFab')));
    await tester.pumpAndSettle();

    // Verify
    expect(find.text('Order Created'), findsOneWidget);
  });
}
```

---

## Test Organization

```
test/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   └── auth_repository_impl_test.dart
│   │   ├── domain/
│   │   │   └── login_usecase_test.dart
│   │   └── presentation/
│   │       ├── login_screen_test.dart
│   │       └── auth_provider_test.dart
│   └── orders/
│       └── ...
├── shared/
│   └── widgets/
│       └── app_button_test.dart
├── helpers/                    # Shared test utilities
│   ├── test_helpers.dart       # Common setup functions
│   ├── mocks.dart              # Mock classes
│   └── fakes.dart              # Fake implementations
└── fixtures/                   # Test data
    └── json/
        └── orders_response.json
```

---

## Mocking

```dart
// Use Mockito or Mocktail for mocking
// Prefer Mocktail — no codegen needed

import 'package:mocktail/mocktail.dart';

class MockOrderRepository extends Mock implements OrderRepository {}

void main() {
  late MockOrderRepository mockRepo;
  late OrdersNotifier notifier;

  setUp(() {
    mockRepo = MockOrderRepository();
    notifier = OrdersNotifier(mockRepo);
  });

  test('loads orders from repository', () async {
    // Arrange
    when(() => mockRepo.fetchAll()).thenAnswer(
      (_) async => [Order(id: '1', name: 'Test')],
    );

    // Act
    await notifier.loadOrders();

    // Assert
    expect(notifier.state, isA<OrdersLoaded>());
    verify(() => mockRepo.fetchAll()).called(1);
  });
}
```

---

## Quality Checklist

- [ ] Unit tests cover all business logic (use cases, models, utilities)
- [ ] Widget tests verify behavior (not widget tree structure)
- [ ] Widget tests use Key-based finders (not text-based for localized apps)
- [ ] Test widgets are wrapped with required ancestors (MaterialApp, providers)
- [ ] `pumpAndSettle()` used after async operations
- [ ] Mock classes are in a shared `helpers/` directory
- [ ] Test file structure mirrors `lib/` structure
- [ ] Integration tests cover critical user journeys
- [ ] Tests are independent (no shared mutable state between tests)
- [ ] All error and loading states are tested
