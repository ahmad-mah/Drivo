import { Router } from "express";
import adminDriverRoutes from "./drivers/admin-driver.routes";

const router = Router();

router.use("/drivers", adminDriverRoutes);

export default router;
