import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { list } from "./admin-audit.controller";

const router = Router();
router.use(ensureAdmin);
router.get("/", list);

export default router;
