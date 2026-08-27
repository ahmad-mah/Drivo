import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RideConnectivityBannerProps {
  visible: boolean;
  connected: boolean;
}

export function RideConnectivityBanner({
  visible,
  connected,
}: RideConnectivityBannerProps) {
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  // True only after the "Connection lost" banner has actually been shown, so
  // "Back online" is announced solely on a real reconnect — not when the socket
  // simply establishes on screen entry while the user was never offline.
  const wasDisconnected = useRef(false);

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      wasDisconnected.current = false;
      return;
    }

    if (connected) {
      if (!wasDisconnected.current) {
        opacity.setValue(0);
      } else {
        opacity.setValue(0);
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(2500),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          wasDisconnected.current = false;
        });
      }
    } else {
      wasDisconnected.current = true;
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, connected, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 8,
        insetInlineStart: 16,
        insetInlineEnd: 16,
        zIndex: 50,
        opacity,
      }}
      pointerEvents="none"
    >
      <View
        className={`items-center rounded-2xl px-4 py-3 ${
          connected ? "bg-green-500" : "bg-amber-500"
        }`}
        style={{
          shadowColor: "#101010",
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          shadowOpacity: 0.12,
          elevation: 4,
        }}
      >
        <Text className="font-Jakarta-SemiBold text-sm text-white">
          {connected ? "Back online" : "Connection lost — reconnecting..."}
        </Text>
      </View>
    </Animated.View>
  );
}
