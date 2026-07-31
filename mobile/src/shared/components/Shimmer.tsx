import { useEffect, useMemo } from "react";
import { Animated, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ShimmerProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  className?: string;
}

export function Shimmer({
  width = "100%",
  height,
  borderRadius = 16,
  className,
}: ShimmerProps) {
  const translateX = useMemo(() => new Animated.Value(-1), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  const shimmerTranslate = translateX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={{ width: width as number | `${number}%`, height, borderRadius }}
      className={`bg-general-300 overflow-hidden ${className ?? ""}`}
    >
      <Animated.View
        className="absolute inset-0"
        style={{ transform: [{ translateX: shimmerTranslate }] }}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 200, height: "100%" }}
        />
      </Animated.View>
    </View>
  );
}
