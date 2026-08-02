import { View, Text } from "react-native";
import { AppButton } from "@/shared/components";
import type { DriverProfile } from "@/api/drivers/drivers.api";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";

type Props = {
  application: DriverProfile;
  onReapply?: () => void;
};

const statusConfig: Record<
  DriverProfile["approvalStatus"],
  { label: string; color: string; bg: string; icon: string }
> = {
  [DriverApprovalStatus.PENDING]: {
    label: "Application Under Review",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    icon: "🕐",
  },
  [DriverApprovalStatus.APPROVED]: {
    label: "Driver Approved",
    color: "text-green-700",
    bg: "bg-green-50",
    icon: "✅",
  },
  [DriverApprovalStatus.REJECTED]: {
    label: "Application Rejected",
    color: "text-red-700",
    bg: "bg-red-50",
    icon: "❌",
  },
  [DriverApprovalStatus.SUSPENDED]: {
    label: "Account Suspended",
    color: "text-orange-700",
    bg: "bg-orange-50",
    icon: "⚠️",
  },
};

export function DriverStatusCard({ application, onReapply }: Props) {
  const config = statusConfig[application.approvalStatus];

  return (
    <View className={`w-full rounded-2xl p-4 ${config.bg}`}>
      <View className="flex-row items-center gap-3 mb-2">
        <Text className="text-xl">{config.icon}</Text>
        <Text className={`text-base font-Jakarta-Bold ${config.color}`}>
          {config.label}
        </Text>
      </View>

      <View className="ml-9">
        <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
          {application.vehicleType} · {application.vehicleModel} · {application.vehicleColor}
        </Text>
        <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
          Plate: {application.vehiclePlate}
        </Text>
      </View>

      {application.rejectionReason && (
        <View className="mt-2 ml-9">
          <Text className="text-xs text-red-600 font-Jakarta-Medium">
            Reason: {application.rejectionReason}
          </Text>
        </View>
      )}

      {application.approvalStatus === DriverApprovalStatus.REJECTED && onReapply && (
        <View className="mt-3 ml-9">
          <AppButton
            title="Re-apply"
            onPress={onReapply}
            variant="outline"
          />
        </View>
      )}
    </View>
  );
}
