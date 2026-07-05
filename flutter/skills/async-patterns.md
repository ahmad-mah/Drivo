# Async Patterns

## When to Load
- Making API calls or database queries
- Working with streams (real-time data, WebSockets)
- Running expensive computations
- Handling file I/O operations

## Prerequisites
- `flutter/rules/dart-idioms.md`
- `flutter/skills/state-management.md`

---

## Core Concepts

### Future vs Stream

| Concept     | Emits           | Use Case                               | Example                             |
| ----------- | --------------- | -------------------------------------- | ----------------------------------- |
| `Future`    | One value/error | Single async result                    | API call, file read, DB query       |
| `Stream`    | Multiple values | Ongoing data flow                      | WebSocket, auth state, Firestore    |

### async/await — The Default Choice

```dart
// GOOD — async/await is clean and readable
Future<User> fetchUser(String id) async {
  final response = await apiClient.get('/users/$id');
  if (response.statusCode != 200) {
    throw ApiException('Failed to fetch user', response.statusCode);
  }
  return User.fromJson(response.body);
}

// GOOD — error handling with try/catch
Future<void> loadOrders() async {
  try {
    final orders = await orderRepository.fetchAll();
    _state = OrdersLoaded(orders);
  } on NetworkException catch (e) {
    _state = OrdersError('No connection: ${e.message}');
  } on ApiException catch (e) {
    _state = OrdersError('Server error: ${e.message}');
  }
  notifyListeners();
}
```

---

## Workflow

### 1. Use FutureBuilder / StreamBuilder Correctly

```dart
// WRONG — creating Future inside build() (re-fetches on every rebuild!)
@override
Widget build(BuildContext context) {
  return FutureBuilder<User>(
    future: fetchUser(userId),  // Creates new Future on EVERY build!
    builder: (context, snapshot) { /* ... */ },
  );
}

// CORRECT — create Future outside build, store as field
class _UserScreenState extends State<UserScreen> {
  late final Future<User> _userFuture;

  @override
  void initState() {
    super.initState();
    _userFuture = fetchUser(widget.userId); // Created ONCE
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User>(
      future: _userFuture,  // Stable reference
      builder: (context, snapshot) {
        return switch (snapshot) {
          AsyncSnapshot(connectionState: ConnectionState.waiting) =>
            const CircularProgressIndicator(),
          AsyncSnapshot(hasError: true, :final error) =>
            ErrorView(message: error.toString()),
          AsyncSnapshot(hasData: true, :final data) =>
            UserProfile(user: data!),
          _ => const SizedBox.shrink(),
        };
      },
    );
  }
}

// BEST — use state management instead of FutureBuilder for business data
// FutureBuilder is best for simple, local async (e.g., loading an image)
```

### 2. Stream Handling

```dart
// StreamBuilder — for display-only streams
StreamBuilder<int>(
  stream: counterStream,
  builder: (context, snapshot) {
    if (snapshot.hasData) {
      return Text('Count: ${snapshot.data}');
    }
    return const CircularProgressIndicator();
  },
);

// For business logic — listen in state management, not in widgets
class ChatNotifier extends ChangeNotifier {
  StreamSubscription<Message>? _subscription;

  void startListening() {
    _subscription = chatRepository.messageStream.listen(
      (message) {
        _messages = [..._messages, message];
        notifyListeners();
      },
      onError: (error) {
        _error = error.toString();
        notifyListeners();
      },
    );
  }

  @override
  void dispose() {
    _subscription?.cancel(); // Always cancel!
    super.dispose();
  }
}
```

### 3. Cancellation and Cleanup

```dart
class _SearchScreenState extends State<SearchScreen> {
  Timer? _debounceTimer;
  CancelableOperation<List<Result>>? _searchOperation;

  void _onSearchChanged(String query) {
    // Cancel previous debounce
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    // Cancel previous search
    await _searchOperation?.cancel();

    _searchOperation = CancelableOperation.fromFuture(
      searchRepository.search(query),
    );

    final results = await _searchOperation!.value;
    if (mounted) { // Check if widget is still alive
      setState(() => _results = results);
    }
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchOperation?.cancel();
    super.dispose();
  }
}
```

### 4. Isolates for Heavy Computation

```dart
// Use Isolate.run for CPU-intensive work (parsing, image processing)
// Runs on a separate thread — UI stays responsive

Future<List<Product>> parseProducts(String jsonString) async {
  // Runs on a separate isolate — doesn't block UI
  return await Isolate.run(() {
    final data = jsonDecode(jsonString) as List;
    return data.map((e) => Product.fromJson(e)).toList();
  });
}

// Use compute() as a simpler alternative
final products = await compute(_parseProducts, jsonString);

List<Product> _parseProducts(String json) {
  // This function must be top-level or static
  final data = jsonDecode(json) as List;
  return data.map((e) => Product.fromJson(e)).toList();
}
```

### 5. Retry and Timeout Patterns

```dart
// Timeout — don't hang forever
Future<Response> fetchWithTimeout(String url) async {
  return await http.get(Uri.parse(url))
      .timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw TimeoutException('Request timed out'),
      );
}

// Retry with exponential backoff
Future<T> retry<T>(
  Future<T> Function() operation, {
  int maxAttempts = 3,
}) async {
  for (var attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (e) {
      if (attempt == maxAttempts - 1) rethrow;
      await Future.delayed(Duration(seconds: 1 << attempt)); // 1s, 2s, 4s
    }
  }
  throw StateError('Unreachable');
}
```

---

## Best Practices

1. **Never create Futures inside `build()`** — they re-execute on every rebuild
2. **Always check `mounted` before `setState` after async gaps** — widget may be disposed
3. **Always cancel subscriptions and timers in `dispose()`** — prevent memory leaks
4. **Use `Isolate.run` for parsing large JSON** — keep UI thread free
5. **Add timeouts to all network calls** — never hang indefinitely
6. **Prefer state management over FutureBuilder** for business data — more control
7. **Use `CancelableOperation` for cancellable requests** — search, autocomplete

---

## Common Mistakes

| Mistake                                  | Why It's Wrong                           | Fix                                        |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Future in `build()`                      | Re-fetches on every widget rebuild       | Create in `initState` or state management  |
| Not cancelling stream subscriptions      | Memory leak, stale callbacks             | Cancel in `dispose()`                      |
| `setState` after `await` without mounted | Crash if widget unmounted during async   | Check `if (mounted)` first                 |
| Blocking UI with heavy computation       | Jank, frozen UI                          | Use `Isolate.run` for CPU work             |
| No timeout on network calls              | App hangs on network failure             | Always add `.timeout()`                    |
| Catching all exceptions silently         | Bugs hidden, no diagnostics              | Catch specific types, log the rest         |
| Nested `.then()` chains                  | Callback hell, unreadable                | Use async/await instead                    |

## Anti-Patterns

### 1. Fire-and-Forget Async
```dart
// ANTI-PATTERN — async call with no error handling
void _onTap() {
  saveOrder(order); // Future ignored — errors disappear silently
}

// FIX — handle the result
Future<void> _onTap() async {
  try {
    await saveOrder(order);
    if (mounted) context.go('/confirmation');
  } catch (e) {
    if (mounted) showErrorSnackbar(context, e.toString());
  }
}
```

### 2. Async InitState
```dart
// ANTI-PATTERN — can't make initState async
@override
void initState() async { // WARNING: This breaks the framework!
  super.initState();
  final data = await fetchData();
}

// FIX — call async method from initState
@override
void initState() {
  super.initState();
  _loadData(); // Non-awaited call to async method
}

Future<void> _loadData() async {
  final data = await fetchData();
  if (mounted) setState(() => _data = data);
}
```

---

## Verification Checklist

- [ ] No Futures created inside `build()` methods
- [ ] All stream subscriptions are cancelled in `dispose()`
- [ ] All timers are cancelled in `dispose()`
- [ ] `mounted` is checked before `setState` after async gaps
- [ ] Heavy computation uses `Isolate.run` or `compute`
- [ ] All network calls have timeouts
- [ ] Errors are caught and handled (not swallowed or ignored)
- [ ] async/await is used instead of `.then()` chains
- [ ] `initState` is not marked `async`
- [ ] Debouncing is used for user-input-driven async (search, autocomplete)
