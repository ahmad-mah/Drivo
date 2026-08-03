import type { DriverProfile } from "@/api/drivers/drivers.api";
import { DriverStatusCard } from "@/features/drivers/components/DriverStatusCard";
import { AppButton, AppGap } from "@/shared/components";
import { goToBecomeDriver } from "@/shared/services/navigation";

interface ProfileDriverSectionProps {
  application: DriverProfile | null;
}

export function ProfileDriverSection({
  application,
}: ProfileDriverSectionProps) {
  if (!application) {
    return <AppButton title="Become a Driver" onPress={goToBecomeDriver} />;
  }

  return (
    <>
      <DriverStatusCard
        application={application}
        onReapply={goToBecomeDriver}
        onChangeVehicle={goToBecomeDriver}
      />
      <AppGap height={20} />
    </>
  );
}
