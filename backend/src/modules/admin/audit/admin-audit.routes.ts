import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { list } from "./admin-audit.controller.js";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);

export default router;
