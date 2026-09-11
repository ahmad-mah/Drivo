import { useState } from "react";
import { Text, View } from "react-native";
import { AppButton, AppDialog } from "@/shared/components";

interface CancelTripDialogProps {
  /** True when the trip is IN_PROGRESS (mid-trip abort); false for pre-trip cancel. */
  inProgress: boolean;
  acting: boolean;
  onCancel: () => void;
}

const CANCEL_CONFIG = {
  trip: {
    title: "Cancel this trip?",
    description: "The rider will be notified and the ride will end.",
    confirmLabel: "Cancel trip",
    keepLabel: "Keep trip",
  },
  ride: {
    title: "Cancel this ride?",
    description: "It will be offered to the next nearest driver.",
    confirmLabel: "Cancel ride",
    keepLabel: "Keep ride",
  },
} as const;

/**
 * Self-contained cancel/abort dialog. Renders the trigger button and manages
 * its own visibility. Pre-trip: re-dispatches to the next driver. Mid-trip:
 * notifies the rider and ends the ride.
 */
export function CancelTripDialog({
  inProgress,
  acting,
  onCancel,
}: CancelTripDialogProps) {
  const [visible, setVisible] = useState(false);
  const config = CANCEL_CONFIG[inProgress ? "trip" : "ride"];

  return (
    <>
      <AppButton
        title={config.confirmLabel}
        variant="danger"
        onPress={() => setVisible(true)}
        disabled={acting}
      />

      <AppDialog visible={visible} onClose={() => setVisible(false)}>
        <Text className="text-center font-Jakarta-Bold text-lg text-secondary-900">
          {config.title}
        </Text>
        <Text className="mt-2 text-center font-Jakarta text-sm text-secondary-500">
          {config.description}
        </Text>
        <View className="mt-5 w-full gap-2">
          <AppButton
            title={config.keepLabel}
            onPress={() => setVisible(false)}
          />
          <AppButton
            title={config.confirmLabel}
            variant="danger"
            loading={acting}
            disabled={acting}
            onPress={() => {
              setVisible(false);
              onCancel();
            }}
          />
        </View>
      </AppDialog>
    </>
  );
}
