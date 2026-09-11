import { useEffect, useMemo, useState } from "react";
import { formatFare } from "@/shared/utils/format";
import { RideStatus } from "../enums/RideStatus";
import { TRIP_TITLES, STATUS_BG, STATUS_ICONS } from "../constants/tripCardConfig";
import type { Ride, RidePoint } from "../types/ride.types";
import { useUserContext } from "@/providers/UserProvider";
import { useLiveEta } from "./useLiveEta";

export interface UseRideTripCardResult {
  ride: Ride;
  inProgress: boolean;
  tripEnded: boolean;
  completed: boolean;
  needsRating: boolean;
  showCountdown: boolean;
  noShowLeft: number | null;
  accentBg: string;
  accentIcon: number;
  title: string;
  driverName: string;
  riderName: string;
  riderImageUrl: string | null;
  fare: string;
  liveEta: number | null;
  etaLoading: boolean;
  statusLine: string;
}

export function useRideTripCard(ride: Ride, alreadyRated: boolean): UseRideTripCardResult {
  const { user } = useUserContext();
  const inProgress = ride.status === RideStatus.IN_PROGRESS;
  const tripEnded = ride.status === RideStatus.TRIP_ENDED;
  const completed = ride.status === RideStatus.COMPLETED;
  const paymentPaid = ride.paymentStatus === "PAID";
  const needsRating = completed && ride.riderRating == null && !alreadyRated;

  // No-show countdown
  const noShowDeadline = useMemo(() => {
    if (ride.arrivedAt == null || ride.noShowInSeconds == null) return null;
    return new Date(ride.arrivedAt).getTime() + ride.noShowInSeconds * 1000;
  }, [ride.arrivedAt, ride.noShowInSeconds]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (noShowDeadline == null || inProgress || completed) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, [noShowDeadline, inProgress, completed]);

  const noShowLeft =
    noShowDeadline != null ? Math.max(0, (noShowDeadline - now) / 1000) : null;
  const showCountdown = noShowDeadline != null && ride.status === RideStatus.ARRIVED;

  // Status display
  const accentBg = STATUS_BG[ride.status] ?? "bg-primary-500";
  const accentIcon = STATUS_ICONS[ride.status] ?? STATUS_ICONS[RideStatus.ACCEPTED];
  const title = completed
    ? "Trip completed"
    : tripEnded
      ? "Trip ended"
      : TRIP_TITLES[ride.status];

  const driverName =
    [ride.driverFirstName, ride.driverLastName].filter(Boolean).join(" ") ||
    "Your driver";
  const riderName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "You";

  const fare = `$${formatFare(ride.fare)}`;

  // Live ETA (only while in progress)
  const destination: RidePoint | null = useMemo(
    () =>
      inProgress
        ? {
            address: ride.destinationAddress,
            latitude: ride.destinationLatitude,
            longitude: ride.destinationLongitude,
          }
        : null,
    [inProgress, ride.destinationAddress, ride.destinationLatitude, ride.destinationLongitude],
  );

  const { etaMinutes: liveEta, loading: etaLoading } = useLiveEta(destination, inProgress);

  // Status line
  const statusLine = completed
    ? "Thanks for riding with Drivo"
    : tripEnded
      ? paymentPaid
        ? "Payment confirmed"
        : "Your driver is waiting for payment"
      : inProgress
        ? liveEta != null
          ? `Arriving in ${liveEta} min`
          : etaLoading
            ? "Calculating ETA..."
            : "Heading to your destination"
        : ride.driverEtaMinutes != null
          ? `${ride.driverEtaMinutes} min away`
          : "Arriving soon";

  return {
    ride,
    inProgress,
    tripEnded,
    completed,
    needsRating,
    showCountdown,
    noShowLeft,
    accentBg,
    accentIcon,
    title,
    driverName,
    riderName,
    riderImageUrl: user?.imageUrl ?? null,
    fare,
    liveEta,
    etaLoading,
    statusLine,
  };
}
