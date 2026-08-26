import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage } from "@/shared/components";

interface RideSearchingCardProps {
  onRequestCancel: () => void;
  cancelling?: boolean;
}

const ESCALATION_THRESHOLD_MS = 40_000;

const MESSAGES = [
  "Waiting for a driver to respond",
  "Still looking for a driver…",
] as const;

export function RideSearchingCard({
  onRequestCancel,
  cancelling = false,
}: RideSearchingCardProps) {
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [fade] = useState(() => new Animated.Value(1));
  const [pulse] = useState(() => new Animated.Value(1));
  const prevIndex = useRef(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(timer);
  }, []);

  // Pulsing ring animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const messageIndex = elapsed >= ESCALATION_THRESHOLD_MS ? 1 : 0;

  useEffect(() => {
    if (messageIndex === prevIndex.current) return;
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    prevIndex.current = messageIndex;
  }, [messageIndex, fade]);

  return (
    <View
      className="rounded-t-4xl bg-white px-5 pt-8"
      style={{
        paddingBottom: insets.bottom + 24,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.08,
        elevation: 8,
      }}
    >
      {/* Hero: pulsing circle */}
      <View className="items-center gap-6">
        <View className="relative items-center justify-center">
          <Animated.View
            className="absolute size-24 rounded-full bg-primary-100"
            style={{ transform: [{ scale: pulse }] }}
          />
          <View className="z-10 size-16 items-center justify-center rounded-full bg-primary-500">
            <AppImage
              source={require("@/assets/icons/search.png")}
              className="size-7"
              tintColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Text */}
        <View className="items-center gap-2">
          <Text className="font-Jakarta-Bold text-xl text-secondary-900">
            Finding your ride
          </Text>
           <Animated.View style={{ opacity: fade }}>
             <Text className="text-center font-Jakarta text-sm text-secondary-500">
               {MESSAGES[messageIndex]}
             </Text>
           </Animated.View>
        </View>
      </View>

      {/* Cancel */}
      <View className="mt-8">
        <AppButton
          title="Cancel ride"
          variant="danger"
          onPress={onRequestCancel}
          loading={cancelling}
        />
      </View>
    </View>
  );
}
