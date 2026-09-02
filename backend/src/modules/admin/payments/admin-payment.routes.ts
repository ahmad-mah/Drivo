import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { list, updateStatus } from "./admin-payment.controller.js";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);
router.put("/:id/status", updateStatus);

export default router;
