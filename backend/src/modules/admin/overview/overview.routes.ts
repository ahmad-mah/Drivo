import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { getOverview } from "./overview.controller";

const router = Router();

router.use(ensureAdmin);

router.get("/", getOverview);

export default router;
