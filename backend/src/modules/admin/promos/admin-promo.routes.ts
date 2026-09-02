import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { list, toggleActive } from "./admin-promo.controller.js";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);
router.put("/:id/toggle", toggleActive);

export default router;
