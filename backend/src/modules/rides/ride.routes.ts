import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  rateRideSchema,
  requestRideSchema,
} from "./ride.validation";
import * as rideController from "./ride.controller";

const router = Router();

// Literal paths first — param routes below must never shadow them.
router.post(
  "/request",
  requireAuth,
  validate(requestRideSchema),
  rideController.request,
);
router.get("/me/active", requireAuth, rideController.getActive);
router.get("/recent", requireAuth, rideController.getRecent);
router.get("/history", requireAuth, rideController.getHistory);
router.get("/driver/active", requireAuth, rideController.getDriverActive);
router.post("/:id/rate", requireAuth, validate(rateRideSchema), rideController.rate);

// Rider
router.delete("/:id/cancel", requireAuth, rideController.cancel);

// Driver-side dispatch responses
router.post("/:id/accept", requireAuth, rideController.accept);
router.post("/:id/reject", requireAuth, rideController.reject);

// Driver trip lifecycle
router.post("/:id/arrive", requireAuth, rideController.arrive);
router.post("/:id/start", requireAuth, rideController.start);
router.post("/:id/arrived-at-destination", requireAuth, rideController.arrivedAtDestination);
router.post("/:id/complete", requireAuth, rideController.complete);
router.post(
  "/:id/no-show",
  requireAuth,
  rideController.noShow,
);
router.post("/:id/driver-cancel", requireAuth, rideController.driverCancel);

export default router;
