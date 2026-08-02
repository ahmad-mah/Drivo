import { useDriverApplication } from "@/features/drivers/hooks/useDriverApplication";
import { DriverStatusCard } from "@/features/drivers/components/DriverStatusCard";
import { AppButton, AppGap } from "@/shared/components";
import { goToBecomeDriver } from "@/shared/services/navigation";

export function ProfileDriverSection() {
  const { application } = useDriverApplication();

  if (!application) {
    return <AppButton title="Become a Driver" onPress={goToBecomeDriver} />;
  }

  return (
    <>
      <DriverStatusCard application={application} onReapply={goToBecomeDriver} />
      <AppGap height={20} />
    </>
  );
}
