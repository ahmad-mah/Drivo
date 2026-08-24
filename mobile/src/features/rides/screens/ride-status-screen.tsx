import { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { goBack } from "@/shared/services/navigation";
import { RideExpiredCard } from "../components/RideExpiredCard";
import { RideDriverAssignedCard } from "../components/RideDriverAssignedCard";
import { RideRequestHeader } from "../components/RideRequestHeader";
import { RideRequestMap } from "../components/RideRequestMap";
import { RideSearchingCard } from "../components/RideSearchingCard";
import { RideStatus } from "../enums/RideStatus";
import { useActiveRide } from "../hooks/useActiveRide";
import { useRideSocket } from "../hooks/useRideSocket";
import { useDirections } from "../hooks/useDirections";
import { useNearbyDrivers } from "../hooks/useNearbyDrivers";
import type { RidePoint } from "../types/ride.types";
import { coordsWithinTolerance } from "../utils/distance";

export function RideStatusScreen() {
  const { ride, loading, error, cancel } = useActiveRide();
  const [serverExpired, setServerExpired] = useState(false);
  const { socketRide } = useRideSocket(() => setServerExpired(true));
  const [cancelling, setCancelling] = useState(false);

  useErrorSnackbar(error);

  const displayRide = serverExpired ? null : (socketRide ?? ride);

  // Cancelling is allowed while PENDING *or* ACCEPTED (interim until trip
  // lifecycle lands) — otherwise a stale accepted ride would block every new
  // request with no way to clear it from the UI.
  const cancellable =
    displayRide?.status === RideStatus.PENDING ||
    displayRide?.status === RideStatus.ACCEPTED;

  const handleCancel = async () => {
    if (!cancellable) {
      goBack();
      return;
    }
    setCancelling(true);
    try {
      await cancel(displayRide!.id);
    } finally {
      setCancelling(false);
    }
    goBack();
  };

  const handleBack = () => {
    if (cancellable) {
      void handleCancel();
    } else {
      goBack();
    }
  };

  const location = useCurrentLocation();
  // Memoized on primitive fields: rebuilding these objects every render made
  // useDirections refetch the Routes API on each nearby-driver/poll update
  // (identical coordinates) and burned through the Google quota (429s).
  const origin: RidePoint | null = useMemo(
    () =>
      displayRide
        ? {
            address: displayRide.originAddress,
            latitude: displayRide.originLatitude,
            longitude: displayRide.originLongitude,
          }
        : null,
    [
      displayRide?.originAddress,
      displayRide?.originLatitude,
      displayRide?.originLongitude,
    ],
  );
  const destination: RidePoint | null = useMemo(
    () =>
      displayRide
        ? {
            address: displayRide.destinationAddress,
            latitude: displayRide.destinationLatitude,
            longitude: displayRide.destinationLongitude,
          }
        : null,
    [
      displayRide?.destinationAddress,
      displayRide?.destinationLatitude,
      displayRide?.destinationLongitude,
    ],
  );
  const { route } = useDirections(origin, destination);
  const { drivers } = useNearbyDrivers(location);
  const originIsCurrentLocation = !!(
    origin &&
    location &&
    coordsWithinTolerance(
      location.coords.latitude,
      location.coords.longitude,
      origin.latitude,
      origin.longitude,
      0.0005,
    )
  );

  const showSearching = !!displayRide && displayRide.status === RideStatus.PENDING;
  const showAccepted = !!displayRide && displayRide.status === RideStatus.ACCEPTED;
  const showExpired = !loading && (!displayRide || displayRide.status === RideStatus.EXPIRED);

  return (
    <View className="flex-1">
      <RideRequestMap
        location={location}
        origin={origin}
        destination={destination}
        route={route}
        drivers={drivers}
        originIsCurrentLocation={originIsCurrentLocation}
      />

      <RideRequestHeader onBack={handleBack} />

      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator />
        </View>
      )}

      <View className="absolute inset-0 justify-end">
        {showSearching && displayRide && (
          <RideSearchingCard
            ride={displayRide}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        )}
        {showAccepted && displayRide && (
          <RideDriverAssignedCard
            ride={displayRide}
            onCancel={handleCancel}
            cancelling={cancelling}
          />
        )}
        {showExpired && <RideExpiredCard onTryAgain={goBack} />}
      </View>
    </View>
  );
}