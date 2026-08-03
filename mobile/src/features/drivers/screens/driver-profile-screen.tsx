import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { hasCompleteProfile, getMissingProfileFields } from "@/shared/utils/profile";
import { useDriverApplication } from "../hooks/useDriverApplication";
import { DriverStatusCard } from "../components/DriverStatusCard";
import { DriverProfileSkeleton } from "../components/DriverProfileSkeleton";
import { goBack, goToBecomeDriver } from "@/shared/services/navigation";
import {
  AppButton,
  AppGap,
  AppIconButton,
  AppSafeArea,
} from "@/shared/components";
import { DriverApprovalStatus } from "../enums/DriverApprovalStatus";
import { getReapplyCooldownDays } from "../utils/driverCooldown";
import { formatAppliedAt } from "../utils/formatDate";

function DriverProfileHeader({ title }: { title: string }) {
  return (
    <View className="pt-4 pb-2">
      <AppIconButton
        icon={require("@/assets/icons/back-arrow.png")}
        onPress={goBack}
        tintColor="#333333"
      />
      <AppGap height={16} />
      <Text className="text-2xl font-Jakarta-Bold text-secondary-900">
        {title}
      </Text>
      <AppGap height={12} />
    </View>
  );
}

export function DriverProfileScreen() {
  const { application, loading, error } = useDriverApplication();
  const { user } = useCurrentUser();
  const { show } = useSnackbar();

  useErrorSnackbar(error?.message ?? null);

  if (loading) return <DriverProfileSkeleton />;

  if (!application) {
    const handleApply = () => {
      if (!hasCompleteProfile(user)) {
        const missing = getMissingProfileFields(user).join(" and ");
        show(
          `Add your ${missing} to your profile before applying to drive`,
        );
        return;
      }
      goToBecomeDriver();
    };

    return (
      <AppSafeArea>
        <DriverProfileHeader title="Driver Profile" />
        <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
          {"You don't have a driver application yet."}
        </Text>
        <AppGap height={20} />
        <AppButton title="Apply to Drive" onPress={handleApply} />
      </AppSafeArea>
    );
  }

  const cooldownDays = getReapplyCooldownDays(application);

  return (
    <AppSafeArea>
      <KeyboardAwareScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        <DriverProfileHeader title="Driver Profile" />
        <DriverStatusCard application={application} />
        {application.approvalStatus === DriverApprovalStatus.REJECTED &&
          application.rejectionReason && (
            <>
              <AppGap height={12} />
              <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <Text className="text-sm font-Jakarta-Bold text-red-700">
                  Rejection Reason
                </Text>
                <Text className="mt-1 text-sm font-Jakarta-Regular text-red-700">
                  {application.rejectionReason}
                </Text>
              </View>
            </>
          )}
        {application.approvalStatus === DriverApprovalStatus.REJECTED &&
          cooldownDays === null && (
            <>
              <AppGap height={12} />
              <AppButton title="Re-apply to Drive" onPress={goToBecomeDriver} />
            </>
          )}
        {application.approvalStatus === DriverApprovalStatus.APPROVED && (
          <>
            <AppGap height={12} />
            <AppButton
              title="Change Vehicle"
              variant="outline"
              onPress={goToBecomeDriver}
            />
          </>
        )}

        <AppGap height={16} />

        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="text-lg font-Jakarta-Bold text-secondary-900">
            Vehicle Details
          </Text>
          <AppGap height={12} />
          <ProfileRow label="Type" value={application.vehicleType} />
          <ProfileRow label="Model" value={application.vehicleModel} />
          <ProfileRow label="Color" value={application.vehicleColor} />
          <ProfileRow label="Plate" value={application.vehiclePlate} />
        </View>

        <AppGap height={16} />

        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="text-lg font-Jakarta-Bold text-secondary-900">
            Driver Information
          </Text>
          <AppGap height={12} />
          <ProfileRow
            label="Name"
            value={`${application.firstName} ${application.lastName}`.trim()}
          />
          <ProfileRow label="Phone" value={application.phone} />
          <ProfileRow label="License" value={application.licenseNumber} />
          <ProfileRow
            label="Applied"
            value={formatAppliedAt(application.createdAt)}
          />
        </View>
      </KeyboardAwareScrollView>
    </AppSafeArea>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
        {label}
      </Text>
      <Text className="text-sm font-Jakarta-Medium text-secondary-900">
        {value}
      </Text>
    </View>
  );
}
