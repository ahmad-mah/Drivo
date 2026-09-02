import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as directionsController from "./directions.controller.js";

const router = Router();

router.get("/eta", requireAuth, directionsController.getEta);
router.get("/", requireAuth, directionsController.getDirections);

export default router;
