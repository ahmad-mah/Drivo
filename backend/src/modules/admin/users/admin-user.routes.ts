import { Router } from "express";
import { ensureAdmin } from "../admin.guard.js";
import { list, getById } from "./admin-user.controller.js";

const router = Router();

router.use(ensureAdmin);

router.get("/", list);
router.get("/:id", getById);

export default router;
