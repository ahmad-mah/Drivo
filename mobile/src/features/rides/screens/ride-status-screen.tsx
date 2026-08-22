import { useState } from "react";
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
  const { socketRide } = useRideSocket();
  const [cancelling, setCancelling] = useState(false);

  useErrorSnackbar(error);

  const displayRide = socketRide ?? ride;

  const handleCancel = async () => {
    const targetRide = displayRide;
    if (!targetRide || targetRide.status !== RideStatus.PENDING) {
      goBack();
      return;
    }
    setCancelling(true);
    try {
      await cancel(targetRide.id);
    } finally {
      setCancelling(false);
    }
    goBack();
  };

  const handleBack = () => {
    if (displayRide && displayRide.status === RideStatus.PENDING) {
      void handleCancel();
    } else {
      goBack();
    }
  };

  const location = useCurrentLocation();
  const origin: RidePoint | null = displayRide
    ? {
        address: displayRide.originAddress,
        latitude: displayRide.originLatitude,
        longitude: displayRide.originLongitude,
      }
    : null;
  const destination: RidePoint | null = displayRide
    ? {
        address: displayRide.destinationAddress,
        latitude: displayRide.destinationLatitude,
        longitude: displayRide.destinationLongitude,
      }
    : null;
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