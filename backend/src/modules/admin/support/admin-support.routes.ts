import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { list, getById, updateStatus } from "./admin-support.controller";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);
router.get("/:id", getById);
router.put("/:id/status", updateStatus);

export default router;
