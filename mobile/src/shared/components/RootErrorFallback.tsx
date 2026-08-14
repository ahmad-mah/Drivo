import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "./AppButton";
import { AppGap } from "./AppGap";

interface RootErrorFallbackProps {
  error: Error;
  retry: () => Promise<void>;
}

export function RootErrorFallback({ error, retry }: RootErrorFallbackProps) {
  const insets = useSafeAreaInsets();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View
      className="flex-1 items-center justify-center bg-white px-6"
      style={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text className="text-6xl">🛠️</Text>
      <AppGap height={24} />
      <Text className="text-2xl font-Jakarta-Bold text-secondary-900">
        Something went wrong
      </Text>
      <AppGap height={8} />
      <Text className="text-center text-sm font-Jakarta-Regular text-secondary-600">
        {error.message}
      </Text>
      <AppGap height={24} />
      <AppButton title="Retry" loading={retrying} onPress={handleRetry} />
    </View>
  );
}
