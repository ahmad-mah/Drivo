# Flutter Documentation Workflow

## Base Workflow
Follow `skills/documentation.md` for general documentation principles. This document adds Flutter and Dart specific documentation standards.

---

## Documentation Flow

```
1. Code-Level Docs (Dartdoc) → 2. Architectural Docs (ADRs) → 3. Project Docs (README)
```

---

## Step 1: Code-Level Documentation (Dartdoc)

Dart uses `///` for documentation comments. These are parsed by tools and IDEs to provide hover text and generate API references.

### Rules for `///` Comments

1. **Document the "Why" and "How", not the "What"**
   The code already tells you *what* it is. The docs should explain its purpose and usage.
2. **Use Markdown inside comments**
   Dartdoc supports standard markdown (bold, code blocks, lists).
3. **Reference other elements using square brackets `[Element]`**
   This creates clickable links in IDEs and generated docs.

### Documenting Classes (Widgets, State, Services)

Always document public classes, especially reusable Widgets and Services.

```dart
/// A primary button used for the main call-to-action on a screen.
///
/// This button automatically adapts its height and styling based on the
/// current [AppTheme].
///
/// Example:
/// ```dart
/// PrimaryButton(
///   label: 'Submit Order',
///   onPressed: () => context.read<OrderBloc>().submit(),
///   isLoading: state is OrderSubmitting,
/// )
/// ```
class PrimaryButton extends StatelessWidget {
  // ...
}
```

### Documenting Methods and Functions

Document what the function does, its parameters, return value, and any exceptions it throws.

```dart
/// Authenticates a user with the backend using their email and password.
///
/// Throws an [AuthException] if the credentials are invalid.
/// Throws a [NetworkException] if the backend cannot be reached.
///
/// Returns a [User] object populated with the user's profile data
/// and an active session token.
Future<User> login(String email, String password) async {
  // ...
}
```

### Documenting Properties

```dart
class User {
  /// The user's unique identifier. Never null.
  final String id;

  /// The user's display name. May be null if the user hasn't set up
  /// their profile yet.
  final String? displayName;
}
```

---

## Step 2: Architectural Documentation (ADRs)

For Flutter projects, Architecture Decision Records (ADRs) are crucial for tracking why certain packages or patterns were chosen.

### Common Flutter ADR Topics:
- **State Management:** Why Riverpod over Bloc? Why Provider over get_it?
- **Routing:** Why GoRouter over AutoRoute or native Navigator 2.0?
- **Network Client:** Why Dio over http?
- **Local Storage:** Why Isar/Hive over SQLite/SharedPreferences?

*See `workflows/decision-making.md` for the ADR template.*

---

## Step 3: Project Documentation (README.md)

A Flutter project's root `README.md` must contain specific setup instructions.

### Required README Sections

1. **Prerequisites:**
   - Required Flutter version (e.g., `Flutter 3.19.0`)
   - Required Dart version
   - Any specific environment setup (e.g., CocoaPods version, Ruby version)

2. **Getting Started:**
   ```bash
   # Clone the repo
   git clone ...

   # Install dependencies
   flutter pub get

   # Run build_runner (if using codegen like freezed or json_serializable)
   flutter pub run build_runner build --delete-conflicting-outputs

   # Run the app
   flutter run
   ```

3. **Code Generation:**
   If your project uses code generation (e.g., `freezed`, `json_serializable`, `riverpod_generator`), explicitly state the command needed to generate files.
   ```bash
   # Watch for changes and generate files automatically
   flutter pub run build_runner watch --delete-conflicting-outputs
   ```

4. **Environment Variables (.env):**
   Document which environment variables are required to run the app (e.g., API keys). Do not commit actual keys. Provide a `.env.example` file.

5. **Architecture Overview:**
   A brief description of the state management and folder structure used.

---

## Quality Checklist

- [ ] All public reusable widgets have `///` documentation with examples
- [ ] All public service methods explain parameters, return values, and thrown exceptions
- [ ] Bracket notation `[ClassName]` is used to link to other symbols
- [ ] `README.md` includes the specific Flutter SDK version required
- [ ] `README.md` includes instructions for running code generators (if applicable)
- [ ] Major technical choices (State Management, Routing) are documented in ADRs
- [ ] No `//` comments used where `///` (dartdoc) should be used
