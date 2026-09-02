import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { getOverview } from "./overview.controller.js";

const router = Router();

router.use(ensureAdmin);

router.get("/", getOverview);

export default router;
