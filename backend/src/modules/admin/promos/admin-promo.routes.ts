import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { list, toggleActive } from "./admin-promo.controller";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);
router.put("/:id/toggle", toggleActive);

export default router;
