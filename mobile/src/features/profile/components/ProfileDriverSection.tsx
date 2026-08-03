import type { DriverProfile } from "@/api/drivers/drivers.api";
import type { UserProfile } from "@/api/users/users.api";
import { DriverStatusCard } from "@/features/drivers/components/DriverStatusCard";
import { AppButton, AppGap } from "@/shared/components";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import {
  goToBecomeDriver,
  goToDriverProfile,
} from "@/shared/services/navigation";
import { hasCompleteProfile, getMissingProfileFields } from "@/shared/utils/profile";

interface ProfileDriverSectionProps {
  application: DriverProfile | null;
  user: UserProfile | null;
}

export function ProfileDriverSection({
  application,
  user,
}: ProfileDriverSectionProps) {
  const { show } = useSnackbar();

  if (!application) {
    const handleBecomeDriver = () => {
      if (!hasCompleteProfile(user)) {
        const missing = getMissingProfileFields(user).join(" and ");
        show(`Add your ${missing} above to become a driver`);
        return;
      }
      goToBecomeDriver();
    };
    return (
      <AppButton title="Become a Driver" onPress={handleBecomeDriver} />
    );
  }

  return (
    <>
      <DriverStatusCard
        application={application}
        onPress={goToDriverProfile}
      />
      <AppGap height={20} />
    </>
  );
}
