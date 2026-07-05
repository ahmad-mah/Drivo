# Flutter Testing Workflow

## Base Workflow
Follow `skills/testing-strategy.md` for general testing principles. This document covers the Flutter-specific testing process.

---

## Testing Flow

```
1. Unit tests (domain + data layers)
2. Widget tests (presentation layer)
3. Integration tests (critical user journeys)
4. Manual verification (themes, accessibility, devices)
```

---

## Step 1: Unit Tests

**Scope:** Business logic, models, repositories, use cases — anything without widgets.

```bash
# Run unit tests
flutter test test/features/orders/domain/
```

### What to Unit Test

| Component           | Test What                                      | Example                                    |
| ------------------- | ---------------------------------------------- | ------------------------------------------ |
| Entities            | Equality, copyWith, computed properties        | `Order.total` calculation                  |
| Value objects        | Validation, formatting                         | `Email.isValid`, `Money.format()`          |
| Use cases           | Business rules, edge cases                     | Empty order, max quantity, discounts       |
| Repositories (impl) | API response parsing, error mapping            | JSON → Entity mapping, 404 → NotFound      |
| State management    | State transitions, side effects                | Loading → Loaded, error handling           |

### State Management Testing

```dart
void main() {
  late OrdersNotifier notifier;
  late MockOrderRepository mockRepo;

  setUp(() {
    mockRepo = MockOrderRepository();
    notifier = OrdersNotifier(mockRepo);
  });

  test('initial state is OrdersInitial', () {
    expect(notifier.state, isA<OrdersInitial>());
  });

  test('emits Loading then Loaded on successful fetch', () async {
    when(() => mockRepo.fetchAll()).thenAnswer(
      (_) async => [Order(id: '1', name: 'Test')],
    );

    final states = <OrdersState>[];
    notifier.addListener(() => states.add(notifier.state));

    await notifier.loadOrders();

    expect(states, [
      isA<OrdersLoading>(),
      isA<OrdersLoaded>(),
    ]);
  });

  test('emits Error on repository failure', () async {
    when(() => mockRepo.fetchAll()).thenThrow(NetworkException());

    await notifier.loadOrders();

    expect(notifier.state, isA<OrdersError>());
  });
}
```

---

## Step 2: Widget Tests

**Scope:** Individual widgets and screens — user interactions, rendering, state display.

```bash
# Run widget tests
flutter test test/features/orders/presentation/
```

### Widget Test Template

```dart
void main() {
  group('OrdersScreen', () {
    late MockOrdersNotifier mockNotifier;

    setUp(() {
      mockNotifier = MockOrdersNotifier();
    });

    Widget buildSubject() {
      return MaterialApp(
        home: ChangeNotifierProvider<OrdersNotifier>.value(
          value: mockNotifier,
          child: const OrdersScreen(),
        ),
      );
    }

    testWidgets('shows loading indicator when loading', (tester) async {
      when(() => mockNotifier.state).thenReturn(OrdersLoading());

      await tester.pumpWidget(buildSubject());

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows orders when loaded', (tester) async {
      when(() => mockNotifier.state).thenReturn(
        OrdersLoaded([Order(id: '1', name: 'Test Order')]),
      );

      await tester.pumpWidget(buildSubject());

      expect(find.text('Test Order'), findsOneWidget);
    });

    testWidgets('shows error with retry when failed', (tester) async {
      when(() => mockNotifier.state).thenReturn(
        OrdersError('Network error'),
      );

      await tester.pumpWidget(buildSubject());

      expect(find.text('Network error'), findsOneWidget);
      expect(find.byKey(const Key('retryButton')), findsOneWidget);
    });

    testWidgets('calls loadOrders on retry tap', (tester) async {
      when(() => mockNotifier.state).thenReturn(OrdersError('Error'));
      when(() => mockNotifier.loadOrders()).thenAnswer((_) async {});

      await tester.pumpWidget(buildSubject());
      await tester.tap(find.byKey(const Key('retryButton')));

      verify(() => mockNotifier.loadOrders()).called(1);
    });
  });
}
```

### What to Widget Test

| Interaction            | What to Verify                                |
| ---------------------- | --------------------------------------------- |
| Initial render         | Correct state displayed (loading/empty/data)  |
| Button tap             | Correct callback called                       |
| Form submission        | Validation shown, data sent correctly         |
| Pull-to-refresh        | Refresh callback triggered                    |
| List scroll            | Items render, pagination triggers             |
| Error state            | Error message shown, retry available          |
| Navigation             | Correct route pushed on action                |

---

## Step 3: Integration Tests

**Scope:** Full app flows with real rendering. Run on emulator/device.

```bash
# Run integration tests
flutter test integration_test/
```

### Critical Journeys to Test

1. **Authentication flow** — login → home screen → logout
2. **Primary user journey** — the main value flow of your app
3. **Error recovery** — network error → retry → success
4. **Deep link** — open app via URL → correct screen

```dart
// integration_test/order_flow_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('user can create an order', (tester) async {
    await tester.pumpWidget(const App());
    await tester.pumpAndSettle();

    // Navigate to create order
    await tester.tap(find.byKey(const Key('createOrderFab')));
    await tester.pumpAndSettle();

    // Fill form
    await tester.enterText(
      find.byKey(const Key('orderNameField')),
      'Test Order',
    );
    await tester.tap(find.byKey(const Key('submitButton')));
    await tester.pumpAndSettle();

    // Verify success
    expect(find.text('Order created successfully'), findsOneWidget);
  });
}
```

---

## Step 4: Manual Verification

| Check                        | How                                             |
| ---------------------------- | ----------------------------------------------- |
| Light theme                  | Run app with light theme                        |
| Dark theme                   | Run app with dark theme                         |
| Large text                   | System settings → accessibility → large text    |
| Screen reader                | Enable TalkBack (Android) or VoiceOver (iOS)    |
| Small screen                 | Run on small device or resize emulator          |
| Large screen / tablet        | Run on tablet or resize emulator                |
| Landscape mode               | Rotate device/emulator                          |
| Slow network                 | Enable network throttling in DevTools           |
| No network                   | Enable airplane mode                            |

---

## Test File Organization

```
test/
├── helpers/
│   ├── pump_app.dart          # Common widget wrapping helpers
│   ├── mocks.dart             # All mock classes
│   └── fakes.dart             # Fake implementations
├── fixtures/
│   ├── order_fixtures.dart    # Reusable test data factories
│   └── user_fixtures.dart
├── features/
│   ├── auth/
│   │   ├── domain/usecases/login_usecase_test.dart
│   │   └── presentation/screens/login_screen_test.dart
│   └── orders/
│       ├── data/repositories/order_repository_test.dart
│       ├── domain/usecases/create_order_test.dart
│       └── presentation/
│           ├── screens/orders_screen_test.dart
│           └── widgets/order_card_test.dart
integration_test/
├── auth_flow_test.dart
└── order_flow_test.dart
```

---

## Quality Checklist

- [ ] All use cases have unit tests
- [ ] All state transitions are tested (loading, success, error)
- [ ] Key interactive widgets have widget tests
- [ ] Critical user journeys have integration tests
- [ ] Tests use Key-based finders (stable across localization)
- [ ] Mock/fake classes are shared in `test/helpers/`
- [ ] Test data uses factories/fixtures (not inline literals)
- [ ] Manual verification done for both themes
- [ ] Manual verification done for accessibility
- [ ] `flutter test` passes with zero failures
