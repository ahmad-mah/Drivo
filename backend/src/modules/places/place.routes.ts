import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import * as placeController from "./place.controller";

const router = Router();

router.get("/autocomplete", requireAuth, placeController.autocomplete);

export default router;