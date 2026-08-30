import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import {
  getById,
  getDetail,
  list,
  listLive,
  approve,
  reject,
  suspend,
  reinstate,
} from "./admin-driver.controller";

const router = Router();

router.use(ensureAdmin);

router.get("/", list);
router.get("/live", listLive);
router.get("/:id", getById);
router.get("/:id/detail", getDetail);
router.put("/:id/approve", approve);
router.put("/:id/reject", reject);
router.put("/:id/suspend", suspend);
router.put("/:id/reinstate", reinstate);

export default router;
