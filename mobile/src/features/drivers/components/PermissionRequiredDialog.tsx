import { Linking, Text } from "react-native";
import { AppButton, AppDialog, AppGap } from "@/shared/components";

interface PermissionRequiredDialogProps {
  visible: boolean;
  onClose: () => void;
}

/** Explains why location permission is needed and jumps to system settings. */
export function PermissionRequiredDialog({
  visible,
  onClose,
}: PermissionRequiredDialogProps) {
  return (
    <AppDialog visible={visible} onClose={onClose}>
      <Text className="text-lg font-Jakarta-Bold text-secondary-900">
        Location permission required
      </Text>
      <AppGap height={8} />
      <Text className="text-center text-sm font-Jakarta-Regular text-secondary-600">
        Location permission was denied. Enable it in Settings to start driving.
      </Text>
      <AppGap height={20} />
      <AppButton
        title="Open Settings"
        onPress={() => {
          onClose();
          void Linking.openSettings();
        }}
      />
      <AppGap height={12} />
      <AppButton title="Cancel" variant="outline" onPress={onClose} />
    </AppDialog>
  );
}
