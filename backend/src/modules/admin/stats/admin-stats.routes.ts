import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { get } from "./admin-stats.controller";

const router = Router();

router.use(ensureAdmin);

router.get("/", get);

export default router;
