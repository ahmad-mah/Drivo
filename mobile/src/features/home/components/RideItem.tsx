import { memo } from "react";
import { Text, View } from "react-native";
import { AppImage } from "@/shared/components";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import { CANCEL_REASON_LABELS } from "@/features/rides/enums/CancellationReason";
import { RideMapThumbnail } from "@/features/rides/components/RideMapThumbnail";
import type { Ride } from "@/features/rides/types/ride.types";

function formatDate(iso: string) {
  const date = new Date(iso);
  const day = date.getDate();
  const month = date.toLocaleString(undefined, { month: "long" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${month} ${year}, ${time}`;
}

function paymentLabel(status: RideStatus): string {
  if (status === RideStatus.COMPLETED) return "Paid";
  if (status === RideStatus.CANCELLED) return "Cancelled";
  if (status === RideStatus.EXPIRED) return "Expired";
  return status;
}

export const RideItem = memo(function RideItem({
  item,
  onRate,
}: {
  item: Ride;
  onRate?: (ride: Ride) => void;
}) {
  const cancelled = item.status === RideStatus.CANCELLED;
  const expired = item.status === RideStatus.EXPIRED;
  const completed = item.status === RideStatus.COMPLETED;
  const driverName =
    item.driverFirstName || item.driverLastName
      ? `${item.driverFirstName ?? ""} ${item.driverLastName ?? ""}`.trim()
      : "—";

  return (
    <View
      className="rounded-[20px] bg-white px-4 py-3.5"
      style={{
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 0.05,
        elevation: 2,
      }}
    >
      {/* Top section: map + locations */}
      <View className="mb-3.5 flex-row items-center gap-3">
        <RideMapThumbnail item={item} />

        <View className="flex-1 justify-center gap-2.5">
          <View className="flex-row items-center gap-2.5">
            <AppImage
              source={require("@/assets/icons/to.png")}
              className="size-6 shrink-0"
              tintColor="#64748B"
            />
            <Text
              className="flex-1 font-Jakarta-SemiBold text-[14px] text-secondary-800"
              numberOfLines={1}
            >
              {item.originAddress}
            </Text>
          </View>
          <View className="flex-row items-center gap-2.5">
            <AppImage
              source={require("@/assets/icons/point.png")}
              className="size-6 shrink-0"
              tintColor="#64748B"
            />
            <Text
              className="flex-1 font-Jakarta text-[14px] text-secondary-600"
              numberOfLines={1}
            >
              {item.destinationAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Info container */}
      <View className="overflow-hidden rounded-2xl bg-primary-100">
        <InfoRow label="Date & Time" value={formatDate(item.createdAt)} />
        <InfoRow label="Driver" value={driverName} />
        <InfoRow
          label="Car seats"
          value={item.seats != null ? String(item.seats) : "—"}
        />
        <InfoRow
          label="Payment Status"
          value={paymentLabel(item.status)}
          valueClassName={
            completed ? "text-green-600" : cancelled ? "text-red-500" : undefined
          }
          isLast
        />
      </View>

      {/* Rating */}
      {completed && item.riderRating != null && (
        <View className="mt-2.5 flex-row items-center gap-1.5 self-end rounded-full bg-primary-100 px-2.5 py-1">
          <Text className="font-Jakarta-Bold text-xs text-primary-500">
            ★ {item.riderRating}.0
          </Text>
        </View>
      )}

      {/* Rate action */}
      {completed && onRate && item.riderRating == null && (
        <Text
          onPress={() => onRate(item)}
          className="mt-2.5 self-start rounded-full bg-primary-500 px-4 py-2 text-center font-Jakarta-Bold text-xs text-white"
        >
          Rate this ride
        </Text>
      )}

      {/* Cancel reason */}
      {cancelled && !expired && item.cancelReason && (
        <Text className="mt-2 font-Jakarta text-xs text-secondary-400">
          {CANCEL_REASON_LABELS[item.cancelReason] ?? item.cancelReason}
        </Text>
      )}
    </View>
  );
});

function InfoRow({
  label,
  value,
  valueClassName,
  isLast,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-3.5 py-3 ${
        isLast ? "" : "border-b border-general-300"
      }`}
    >
      <Text className="font-Jakarta-Medium text-[14px] text-secondary-600">
        {label}
      </Text>
      <Text
        className={`font-Jakarta-SemiBold text-[14px] text-secondary-800 ${
          valueClassName ?? ""
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
