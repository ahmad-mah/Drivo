import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { list, updateStatus } from "./admin-payment.controller";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);
router.put("/:id/status", updateStatus);

export default router;
