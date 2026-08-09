import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  applyDriverSchema,
  updateAvailabilitySchema,
  updateLocationSchema,
} from "./driver.validation";
import {
  apply,
  getMyApplication,
  updateApplication,
  updateAvailability,
  updateLocation,
} from "./driver.controller";

const router = Router();

router.post("/apply", requireAuth, validate(applyDriverSchema), apply);
router.get("/my-application", requireAuth, getMyApplication);
router.put("/my-application", requireAuth, validate(applyDriverSchema), updateApplication);
router.put("/availability", requireAuth, validate(updateAvailabilitySchema), updateAvailability);
router.post("/location", requireAuth, validate(updateLocationSchema), updateLocation);

export default router;
