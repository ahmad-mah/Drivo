import { Pressable, Text, View } from "react-native";
import { AppDialog } from "@/shared/components/AppDialog";
import { AppButton } from "@/shared/components/AppButton";

interface TripHelpDialogProps {
  visible: boolean;
  onReport: () => void;
  onClose: () => void;
}

export function TripHelpDialog({
  visible,
  onReport,
  onClose,
}: TripHelpDialogProps) {
  return (
    <AppDialog visible={visible} onClose={onClose}>
      <View className="mb-4 size-14 items-center justify-center rounded-full bg-primary-100">
        <Text className="text-2xl">🛡️</Text>
      </View>
      <Text className="font-Jakarta-Bold text-lg text-secondary-900">
        Need help?
      </Text>
      <Text className="mt-2 text-center font-Jakarta text-sm leading-5 text-secondary-500">
        Your safety matters. Share your trip details with someone you trust, or
        report an issue with your ride.
      </Text>
      <View className="mt-6 w-full gap-2.5">
        <Pressable
          onPress={onReport}
          className="w-full items-center rounded-full border border-general-300 py-4"
        >
          <Text className="font-Jakarta-Bold text-base text-secondary-900">
            Report a problem
          </Text>
        </Pressable>
        <AppButton title="Close" onPress={onClose} />
      </View>
    </AppDialog>
  );
}
