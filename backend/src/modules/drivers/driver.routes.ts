import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  applyDriverSchema,
  updateAvailabilitySchema,
  updateLocationSchema,
} from "./driver.validation.js";
import {
  apply,
  getMyApplication,
  updateApplication,
  updateAvailability,
  updateLocation,
  getNearbyDrivers,
} from "./driver.controller.js";

const router = Router();

router.post("/apply", requireAuth, validate(applyDriverSchema), apply);
router.get("/my-application", requireAuth, getMyApplication);
router.put("/my-application", requireAuth, validate(applyDriverSchema), updateApplication);
router.put("/availability", requireAuth, validate(updateAvailabilitySchema), updateAvailability);
router.post("/location", requireAuth, validate(updateLocationSchema), updateLocation);
router.get("/nearby", requireAuth, getNearbyDrivers);

export default router;
