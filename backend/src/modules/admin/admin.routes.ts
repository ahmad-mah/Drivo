import { Router } from "express";
import adminDriverRoutes from "./drivers/admin-driver.routes";
import adminOverviewRoutes from "./overview/overview.routes";
import adminTripRoutes from "./trips/admin-trip.routes";
import adminUserRoutes from "./users/admin-user.routes";
import adminStatsRoutes from "./stats/admin-stats.routes";
import adminPaymentRoutes from "./payments/admin-payment.routes";
import adminSupportRoutes from "./support/admin-support.routes";
import adminAuditRoutes from "./audit/admin-audit.routes";

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
