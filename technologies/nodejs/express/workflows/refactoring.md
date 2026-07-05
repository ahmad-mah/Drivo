# Node.js Refactoring Workflow

## Base Workflow
Follow `workflows/refactoring.md` as the foundation. This document adds Node.js-specific refactoring patterns.

---

## Common Node.js Refactorings

### 1. The "Fat Controller" to Service Refactor

**When:** A controller method is > 50 lines and contains business logic (if/else rules) and database calls.

```typescript
// BEFORE — Fat Controller
export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  
  // DB logic inside controller
  const existing = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existing) return res.status(400).send('Email in use');

  // Business logic inside controller
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const newUser = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);
  
  res.status(201).json(newUser);
};
```

**Steps to Fix:**
1. Create `UserService`.
2. Move the DB checks and password hashing to `UserService.register(email, password)`.
3. If email is in use, throw a custom `ConflictError` from the service.
4. The controller simply calls `const user = await userService.register(req.body); res.json(user);`.

### 2. Manual Validation to Zod Middleware

**When:** Controllers begin with 10 lines of `if (!req.body.x)` statements.

**Steps:**
1. Define a Zod schema `const schema = z.object({...})`.
2. Create a generic validation middleware (if not already existing).
3. Apply `validate(schema)` to the router definition.
4. Delete all manual validation `if` statements from the controller.

### 3. Extracting Database Logic to Repositories

**When:** Services are cluttered with raw SQL strings or complex Prisma `include` blocks.

**Steps:**
1. Create a `UserRepository` class.
2. Move the raw DB call from the Service into `UserRepository.findByEmail(email)`.
3. Inject the Repository into the Service.
4. The Service now reads like pure English: `this.userRepo.findByEmail(email)`.

### 4. Replacing Try/Catch Pyramids with `catchAsync`

**When:** Every controller method is wrapped in a massive `try/catch`, creating indentation hell.

**Steps:**
1. Import `catchAsync` wrapper (or rely on Express 5.x).
2. Remove the `try` and `catch` blocks.
3. Wrap the controller function definition in `catchAsync(async (req, res, next) => { ... })`.

---

## Node.js-Specific Safety Rules

1. **Test Coverage is Mandatory:** Do not perform structural refactoring (moving logic between layers) unless the endpoint is covered by Integration (API) tests. You must prove the JSON response remains identical.
2. **Watch for Context (`this`):** When moving methods into Classes (Controllers/Services), watch out for `this` becoming undefined when passed as a callback to the Express Router. Use Arrow Functions in classes to preserve `this`.

```typescript
// DANGER
router.get('/', userController.getUsers); // `this` is lost!

// FIX: Define methods as arrow functions in the class
class UserController {
  getUsers = async (req, res) => { ... } // `this` is preserved
}
```

---

## Verification

- [ ] All tests pass after moving logic.
- [ ] No HTTP objects (`req`, `res`) have leaked into the Service layer.
- [ ] No database objects (SQL connections, Prisma clients) are imported directly into the Controller layer.
- [ ] Route definitions look clean and declarative (`router.post('/', validate(schema), controller.create)`).
