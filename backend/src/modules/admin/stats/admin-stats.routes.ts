import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { get } from "./admin-stats.controller.js";

const router = Router();

router.use(ensureAdmin);

router.get("/", get);

export default router;
