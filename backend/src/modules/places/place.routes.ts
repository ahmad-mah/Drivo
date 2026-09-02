import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as placeController from "./place.controller.js";

const router = Router();

router.get("/autocomplete", requireAuth, placeController.autocomplete);

export default router;