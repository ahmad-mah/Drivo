import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as directionsController from "./directions.controller";

const router = Router();

router.get("/", requireAuth, directionsController.getDirections);

export default router;
