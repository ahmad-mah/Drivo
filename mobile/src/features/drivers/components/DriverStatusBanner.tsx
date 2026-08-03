import type { DriverProfile } from "@/api/drivers/drivers.api";
import { DriverStatusCard } from "@/features/drivers/components/DriverStatusCard";

interface DriverStatusBannerProps {
  application: DriverProfile;
  onReapply?: () => void;
  onChangeVehicle?: () => void;
}

export function DriverStatusBanner({
  application,
  onReapply,
  onChangeVehicle,
}: DriverStatusBannerProps) {
  return (
    <DriverStatusCard
      application={application}
      onReapply={onReapply}
      onChangeVehicle={onChangeVehicle}
      compact
    />
  );
}
