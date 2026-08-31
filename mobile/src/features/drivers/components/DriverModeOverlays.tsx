import { ConnectivityBanner } from "./ConnectivityBanner";
import { DriverModeFooter } from "./DriverModeFooter";
import { IncomingRideSheet } from "./IncomingRideSheet";
import { TripPanel } from "./TripPanel";
import type { IncomingRideRequest } from "@/api/drivers/drivers.api";
import type { Ride } from "@/features/rides/types/ride.types";

interface DriverModeOverlaysProps {
  autoOffline: boolean;
  backOnline: boolean;
  availability: {
    isOnline: boolean;
    busy: boolean;
    gpsAvailable: boolean;
    socketConnected: boolean;
    onToggle: () => void;
  };
  incoming: {
    request: IncomingRideRequest | null;
    secondsLeft: number;
    responding: boolean;
    onAccept: () => void;
    onReject: () => void;
  };
  trip: {
    trip: Ride | null;
    loading: boolean;
    acting: boolean;
    onArrive: () => void;
    onStart: () => void;
    onArrivedAtDestination: () => void;
    onComplete: () => void;
    onCancel: (reason?: string) => void;
    onNoShow: () => void;
    onDismissSummary: () => void;
  };
}

/**
 * The driver-mode screen's stacked overlays, chosen by priority: an active
 * trip owns the screen (availability footer hidden), otherwise a pending
 * offer card may sit above the footer.
 */
export function DriverModeOverlays({
  autoOffline,
  backOnline,
  availability,
  incoming,
  trip,
}: DriverModeOverlaysProps) {
  return (
    <>
      {(autoOffline || backOnline) && (
        <ConnectivityBanner
          autoOffline={autoOffline}
          backOnline={backOnline}
        />
      )}
      {!trip.trip && !trip.loading && (
        <>
          {incoming.request && (
            <IncomingRideSheet
              request={incoming.request}
              secondsLeft={incoming.secondsLeft}
              responding={incoming.responding}
              onAccept={incoming.onAccept}
              onReject={incoming.onReject}
            />
          )}
          <DriverModeFooter
            isOnline={availability.isOnline}
            autoOffline={autoOffline}
            busy={availability.busy}
            gpsAvailable={availability.gpsAvailable}
            socketConnected={availability.socketConnected}
            onToggle={availability.onToggle}
          />
        </>
      )}
      {trip.trip && (
        <TripPanel
          trip={trip.trip}
          acting={trip.acting}
          onArrive={trip.onArrive}
          onStart={trip.onStart}
          onArrivedAtDestination={trip.onArrivedAtDestination}
          onComplete={trip.onComplete}
          onCancel={trip.onCancel}
          onNoShow={trip.onNoShow}
          onDismissSummary={trip.onDismissSummary}
        />
      )}
    </>
  );
}
