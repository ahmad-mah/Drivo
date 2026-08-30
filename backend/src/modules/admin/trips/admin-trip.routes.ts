import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { list, getById, cancel } from "./admin-trip.controller";

const router = Router();

router.use(ensureAdmin);

router.get("/", list);
router.get("/:id", getById);
router.put("/:id/cancel", cancel);

export default router;
