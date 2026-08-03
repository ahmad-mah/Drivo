import type { DriverProfile } from "@/api/drivers/drivers.api";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";

export const REAPPLY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function getReapplyCooldownDays(
  application: DriverProfile,
): number | null {
  if (
    application.approvalStatus !== DriverApprovalStatus.REJECTED ||
    !application.rejectedAt
  ) {
    return null;
  }

  const elapsedMs = Date.now() - new Date(application.rejectedAt).getTime();
  if (elapsedMs >= REAPPLY_COOLDOWN_MS) return null;

  return Math.ceil(
    (REAPPLY_COOLDOWN_MS - elapsedMs) / (24 * 60 * 60 * 1000),
  );
}
