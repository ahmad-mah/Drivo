import { View } from "react-native";
import { useKeyboardHeight } from "@/shared/hooks/useKeyboardHeight";
import { NearbyDriversSheet } from "./NearbyDriversSheet";
import { RideInfoSheet } from "./RideInfoSheet";
import { RideRequestForm } from "./RideRequestForm";
import type { RideRequestFormProps } from "./RideRequestForm";
import { RideSearchingCard } from "./RideSearchingCard";
import { RideTripCard } from "./RideTripCard";
import { SheetStep } from "../enums/SheetStep";
import type { NearbyDriver, PickField, Ride, RidePoint } from "../types/ride.types";

interface RideBottomSheetProps {
  activeSheet: SheetStep;
  /** Disabled when an action is in flight. */
  busy: boolean;
  // ── Form step ────────────────────────────────
  formProps: Omit<RideRequestFormProps, "findNowLoading" | "pickingField" | "onRequestPickMap">;
  findNowLoading: boolean;
  pickingField: PickField | null;
  onRequestPickMap: (field: PickField) => void;
  // ── Drivers step ─────────────────────────────
  drivers: NearbyDriver[];
  driversLoading: boolean;
  expired: boolean;
  onPickDriverFromList: (driver: NearbyDriver) => void;
  onTryAgain: () => void;
  // ── RideInfo step ────────────────────────────
  selectedDriver: NearbyDriver | null;
  effectiveOrigin: RidePoint | null;
  effectiveDestination: RidePoint | null;
  onConfirmRide: () => void;
  confirmLoading: boolean;
  // ── Searching step ───────────────────────────
  displayRide: Ride | null;
  onRequestCancel: () => void;
  cancelling: boolean;
  // ── Trip step ────────────────────────────────
  onRequestHelp: () => void;
  onRate: (stars: number, comment?: string) => void;
  ratingSubmitting: boolean;
  alreadyRated: boolean;
  onDone: () => void;
  // ── Payment ──────────────────────────────────
  onPay?: () => void;
  paying?: boolean;
}

export function RideBottomSheet({
  activeSheet,
  busy,
  formProps,
  findNowLoading,
  pickingField,
  onRequestPickMap,
  drivers,
  driversLoading,
  expired,
  onPickDriverFromList,
  onTryAgain,
  selectedDriver,
  effectiveOrigin,
  effectiveDestination,
  onConfirmRide,
  confirmLoading,
  displayRide,
  onRequestCancel,
  cancelling,
  onRequestHelp,
  onRate,
  ratingSubmitting,
  alreadyRated,
  onDone,
  onPay,
  paying,
}: RideBottomSheetProps) {
  const keyboardHeight = useKeyboardHeight();
  const isFormStep = activeSheet === SheetStep.FORM;

  const showSearching = activeSheet === SheetStep.SEARCHING;
  const showTrip = activeSheet === SheetStep.TRIP && displayRide != null;

  return (
    <View
      className={`absolute inset-x-0 bottom-0 justify-end ${
        activeSheet === SheetStep.RIDE_INFO ? "max-h-[92%]" : "h-[60%]"
      }`}
      style={isFormStep ? { paddingBottom: keyboardHeight } : undefined}
      pointerEvents={busy ? "none" : "auto"}
    >
      {activeSheet === SheetStep.FORM && (
        <RideRequestForm
          {...formProps}
          findNowLoading={findNowLoading}
          pickingField={pickingField}
          onRequestPickMap={onRequestPickMap}
        />
      )}

      {activeSheet === SheetStep.DRIVERS && (
        <NearbyDriversSheet
          drivers={drivers}
          loading={driversLoading}
          expired={expired}
          onPickDriver={onPickDriverFromList}
          onTryAgain={onTryAgain}
        />
      )}

      {activeSheet === SheetStep.RIDE_INFO && selectedDriver && (
        <RideInfoSheet
          driver={selectedDriver}
          origin={effectiveOrigin}
          destination={effectiveDestination}
          onConfirm={onConfirmRide}
          confirmLoading={confirmLoading}
        />
      )}

      {showSearching && (
        <RideSearchingCard
          onRequestCancel={onRequestCancel}
          cancelling={cancelling}
        />
      )}

      {showTrip && displayRide && (
        <RideTripCard
          ride={displayRide}
          onRequestCancel={onRequestCancel}
          cancelling={cancelling}
          onRequestHelp={onRequestHelp}
          onRate={onRate}
          ratingSubmitting={ratingSubmitting}
          alreadyRated={alreadyRated}
          onDone={onDone}
          onPay={onPay}
          paying={paying}
        />
      )}
    </View>
  );
}
