import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { requestRideSchema } from "./ride.validation";
import * as rideController from "./ride.controller";

const router = Router();

router.post(
  "/request",
  requireAuth,
  validate(requestRideSchema),
  rideController.request,
);
router.get("/me/active", requireAuth, rideController.getActive);
router.delete("/:id/cancel", requireAuth, rideController.cancel);
router.get("/recent", requireAuth, rideController.getRecent);

// Driver-side dispatch responses
router.post("/:id/accept", requireAuth, rideController.accept);
router.post("/:id/reject", requireAuth, rideController.reject);

export default router;