import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { applyDriverSchema } from "./driver.validation";
import { apply, getMyApplication, updateApplication } from "./driver.controller";

const router = Router();

router.post("/apply", requireAuth, validate(applyDriverSchema), apply);
router.get("/my-application", requireAuth, getMyApplication);
router.put("/my-application", requireAuth, validate(applyDriverSchema), updateApplication);

export default router;
