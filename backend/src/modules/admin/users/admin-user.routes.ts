import { Router } from "express";
import { ensureAdmin } from "../admin.guard";
import { list, getById } from "./admin-user.controller";

const router = Router();

router.use(ensureAdmin);

router.get("/", list);
router.get("/:id", getById);

export default router;
