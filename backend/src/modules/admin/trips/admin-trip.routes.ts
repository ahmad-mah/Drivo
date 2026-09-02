import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { list, getById, cancel } from "./admin-trip.controller.js";

const router = Router();

router.use(ensureAdmin);

router.get("/", list);
router.get("/:id", getById);
router.put("/:id/cancel", cancel);

export default router;
