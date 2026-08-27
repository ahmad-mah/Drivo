import { Text, View } from "react-native";
import { AppDialog } from "@/shared/components/AppDialog";
import { AppButton } from "@/shared/components/AppButton";

interface CancelRideConfirmDialogProps {
  visible: boolean;
  variant: "pre-trip" | "mid-trip";
  onConfirm: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

const COPY = {
  "pre-trip": {
    title: "Cancel ride?",
    body: "Your driver is on the way. Cancelling now may affect your rating.",
    confirm: "Yes, cancel",
    dismiss: "Keep ride",
  },
  "mid-trip": {
    title: "Cancel trip?",
    body: "Your driver has already started heading to your destination. Cancelling mid-trip may result in a fee.",
    confirm: "Yes, cancel trip",
    dismiss: "Keep trip",
  },
} as const;

export function CancelRideConfirmDialog({
  visible,
  variant,
  onConfirm,
  onDismiss,
  loading = false,
}: CancelRideConfirmDialogProps) {
  const copy = COPY[variant];

  return (
    <AppDialog visible={visible} onClose={onDismiss}>
      <View className="mb-4 size-14 items-center justify-center rounded-full bg-danger-100">
        <Text className="text-2xl">⚠️</Text>
      </View>
      <Text className="font-Jakarta-Bold text-lg text-secondary-900">
        {copy.title}
      </Text>
      <Text className="mt-2 text-center font-Jakarta text-sm leading-5 text-secondary-500">
        {copy.body}
      </Text>
      <View className="mt-6 w-full gap-2.5">
        <AppButton title={copy.dismiss} onPress={onDismiss} />
        <AppButton
          title={copy.confirm}
          variant="danger"
          loading={loading}
          disabled={loading}
          onPress={onConfirm}
        />
      </View>
    </AppDialog>
  );
}
