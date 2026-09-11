import { RideStatus, RidePaymentStatus } from "../enums/RideStatus";

export function formatDate(iso: string) {
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

export function paymentLabel(status: RideStatus): string {
  if (status === RideStatus.COMPLETED) return "Paid";
  if (status === RideStatus.CANCELLED) return "Cancelled";
  if (status === RideStatus.EXPIRED) return "Expired";
  return status;
}

export function paymentStatusColor(
  rideStatus: RideStatus,
  paymentStatus: RidePaymentStatus | null,
): string | undefined {
  if (rideStatus === RideStatus.CANCELLED || rideStatus === RideStatus.EXPIRED)
    return "text-red-500";
  if (rideStatus === RideStatus.COMPLETED || paymentStatus === RidePaymentStatus.PAID)
    return "text-green-600";
  if (paymentStatus === RidePaymentStatus.PENDING) return "text-yellow-500";
  return undefined;
}

export function driverDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  if (firstName || lastName)
    return `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return "—";
}
