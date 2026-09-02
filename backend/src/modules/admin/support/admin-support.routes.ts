import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { list, getById, updateStatus } from "./admin-support.controller.js";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);
router.get("/:id", getById);
router.put("/:id/status", updateStatus);

export default router;
