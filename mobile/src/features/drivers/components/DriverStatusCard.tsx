import { View, Text } from "react-native";
import { AppButton } from "@/shared/components";
import type { DriverProfile } from "@/api/drivers/drivers.api";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { driverStatusConfig } from "../constants/driverStatusConfig";
import { getReapplyCooldownDays } from "../utils/driverCooldown";

type Props = {
  application: DriverProfile;
  onReapply?: () => void;
  onChangeVehicle?: () => void;
  compact?: boolean;
};

export function DriverStatusCard({
  application,
  onReapply,
  onChangeVehicle,
  compact,
}: Props) {
  const config = driverStatusConfig[application.approvalStatus];
  const cooldownDays = getReapplyCooldownDays(application);

  return (
    <View className={`w-full rounded-2xl p-4 ${config.bg}`}>
      <View className="flex-row items-center gap-3 mb-2">
        <Text className="text-xl">{config.icon}</Text>
        <Text className={`text-base font-Jakarta-Bold ${config.color}`}>
          {config.label}
        </Text>
      </View>

      <View className="ml-9">
        {!compact && (
          <>
            <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
              {application.vehicleType} · {application.vehicleModel} ·{" "}
              {application.vehicleColor}
            </Text>
            <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
              Plate: {application.vehiclePlate}
            </Text>
          </>
        )}
        {compact && (
          <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
            {cooldownDays !== null
              ? `You can re-apply in ${cooldownDays} day${cooldownDays === 1 ? "" : "s"}.`
              : config.description}
          </Text>
        )}
      </View>

      {application.rejectionReason && !compact && (
        <View className="mt-2 ml-9">
          <Text className="text-xs text-red-600 font-Jakarta-Medium">
            Reason: {application.rejectionReason}
          </Text>
        </View>
      )}

      {cooldownDays !== null && !compact && (
        <View className="mt-3 ml-9">
          <Text className="text-sm text-red-600 font-Jakarta-Medium">
            You can re-apply in {cooldownDays} day{cooldownDays === 1 ? "" : "s"}.
          </Text>
        </View>
      )}

      {application.approvalStatus === DriverApprovalStatus.REJECTED &&
        cooldownDays === null &&
        onReapply && (
          <View className="mt-3 ml-9">
            <AppButton
              title={compact ? "Re-apply to Drive" : "Re-apply"}
              onPress={onReapply}
              variant="outline"
            />
          </View>
        )}

      {application.approvalStatus === DriverApprovalStatus.APPROVED &&
        onChangeVehicle && (
          <View className="mt-3 ml-9">
            <AppButton
              title="Change Vehicle"
              onPress={onChangeVehicle}
              variant="outline"
            />
          </View>
        )}
    </View>
  );
}
