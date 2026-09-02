import { Router } from "express";
import adminDriverRoutes from "./drivers/admin-driver.routes.js";
import adminOverviewRoutes from "./overview/overview.routes.js";
import adminTripRoutes from "./trips/admin-trip.routes.js";
import adminUserRoutes from "./users/admin-user.routes.js";
import adminStatsRoutes from "./stats/admin-stats.routes.js";
import adminPaymentRoutes from "./payments/admin-payment.routes.js";
import adminSupportRoutes from "./support/admin-support.routes.js";
import adminAuditRoutes from "./audit/admin-audit.routes.js";

const router = Router();

router.use("/drivers", adminDriverRoutes);
router.use("/overview", adminOverviewRoutes);
router.use("/trips", adminTripRoutes);
router.use("/users", adminUserRoutes);
router.use("/stats", adminStatsRoutes);
router.use("/payments", adminPaymentRoutes);
router.use("/support", adminSupportRoutes);
router.use("/audit", adminAuditRoutes);

export default router;
