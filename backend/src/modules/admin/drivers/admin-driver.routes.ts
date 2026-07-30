import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import {
  list,
  approve,
  reject,
  suspend,
  reinstate,
} from "./admin-driver.controller";

const router = Router();

router.use(ensureAdmin);

router.get("/", list);
router.put("/:id/approve", approve);
router.put("/:id/reject", reject);
router.put("/:id/suspend", suspend);
router.put("/:id/reinstate", reinstate);

export default router;
