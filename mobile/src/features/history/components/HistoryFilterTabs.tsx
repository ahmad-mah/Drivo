import { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export type RideFilter = "all" | "completed" | "cancelled";

export const FILTERS: { key: RideFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

interface HistoryFilterTabsProps {
  active: RideFilter;
  onChange: (key: RideFilter) => void;
}

/**
 * Segmented filter control with a pill that slides between tabs. The pill's
 * position is measured from each tab's layout (onLayout) and animated with
 * core Animated — no backdrop/back dismissal, no reanimated plugin required.
 */
export function HistoryFilterTabs({ active, onChange }: HistoryFilterTabsProps) {
  const rects = useRef<Record<string, { x: number; width: number }>>({});
  const [pillX] = useState(() => new Animated.Value(0));
  const [pillW] = useState(() => new Animated.Value(0));
  const ready = useRef(false);

  useEffect(() => {
    const rect = rects.current[active];
    if (!rect) return;
    if (!ready.current) return;
    Animated.parallel([
      Animated.timing(pillX, {
        toValue: rect.x,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(pillW, {
        toValue: rect.width,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active, pillX, pillW]);

  return (
    <View className="relative mb-4 flex-row gap-2">
      <Animated.View
        className="absolute rounded-full bg-secondary-900"
        style={{
          top: 0,
          bottom: 0,
          transform: [{ translateX: pillX }],
          width: pillW,
        }}
      />
      {FILTERS.map((f) => {
        const isActive = f.key === active;
        return (
          <TouchableOpacity
            key={f.key}
            activeOpacity={0.8}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              rects.current[f.key] = { x, width };
              if (!ready.current && f.key === active) {
                ready.current = true;
                pillX.setValue(x);
                pillW.setValue(width);
              }
            }}
            onPress={() => onChange(f.key)}
            className="rounded-full px-4 py-1.5"
          >
            <Text
              className={`font-Jakarta-SemiBold text-sm ${
                isActive ? "text-white" : "text-secondary-500"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
