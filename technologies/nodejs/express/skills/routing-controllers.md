# Routing & Controllers

## 1. Load Conditions
- **Trigger**: Defining API endpoints, extracting HTTP payload data, typing requests.
- **Prerequisites**: `node-express/rules/project-structure.md`

## 2. Core Directives
- **Separation of Concerns**: Controllers MUST ONLY handle HTTP (extracting `req`, formatting `res`). Business logic MUST live in Services.
- **Strict Typing**: Express `Request` MUST be strongly typed using TypeScript generics `Request<Params, ResBody, ReqBody, ReqQuery>`.
- **Async Wrapping**: All async controller methods MUST be wrapped in an async error handler or `try/catch` calling `next(error)`.

## 3. Implementation Workflow

### Step 1: Define the Router
```typescript
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const userController = new UserController();

// Apply middleware at route level
router.post('/', validate(createUserSchema), userController.createUser);

export default router;
```

### Step 2: Build the Controller
Use arrow functions to preserve `this` context when passing to the router.
```typescript
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserBody } from '../schemas/user.schema';

export class UserController {
  private userService = new UserService();

  // Strongly type the request body
  public createUser = async (
    req: Request<{}, {}, CreateUserBody>, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error); // Pass to global error handler
    }
  };
}
```

## 4. Anti-Patterns & Edge Cases

| Anti-Pattern / Mistake | Correction |
| --- | --- |
| "Fat" Route | Moving DB queries and validation into `router.post(...)`. Extract to Controller and Service. |
| Dropping `this` Context | Passing `userController.create` directly without binding or using arrow functions. MUST use arrow functions in controller classes. |
| Hanging Promises | Forgetting to `await` the service call. Returns an empty object to the client. |

## 5. Verification Checklist
- [ ] Route definitions isolated from Controller logic.
- [ ] Controller methods strongly type `req.body`, `req.query`, and `req.params`.
- [ ] Controller methods handle errors by passing them to `next(error)`.
- [ ] Arrow functions used in classes to avoid binding issues.
