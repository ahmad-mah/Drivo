import { ActivityIndicator, Modal, Text, View } from "react-native";

type AppLoadingOverlayProps = {
  visible: boolean;
  label?: string;
};

export function AppLoadingOverlay({ visible, label }: AppLoadingOverlayProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/30 px-8">
        <View className="flex-row items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-lg">
          <ActivityIndicator size="small" color="#0286ff" />
          {label ? (
            <Text className="text-sm font-Jakarta-Medium text-secondary-700">
              {label}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
