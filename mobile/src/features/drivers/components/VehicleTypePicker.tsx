import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { AppImage } from "@/shared/components";
import { VehicleType } from "@/features/drivers/enums/VehicleType";

type Props = {
  value: VehicleType | "";
  onChange: (value: VehicleType) => void;
};

const vehicleIcons: Record<VehicleType, string> = {
  [VehicleType.Sedan]: "🚗",
  [VehicleType.SUV]: "🚙",
  [VehicleType.Hatchback]: "🚘",
  [VehicleType.Van]: "🚐",
  [VehicleType.Truck]: "🛻",
  [VehicleType.Motorcycle]: "🏍️",
  [VehicleType.Other]: "📦",
};

export function VehicleTypePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anim] = useState(() => new Animated.Value(0));
  const selected = value ? vehicleIcons[value] ?? "🚗" : null;

  const openList = () => {
    setMounted(true);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeList = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setMounted(false));
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
      closeList();
    } else {
      setOpen(true);
      openList();
    }
  };

  const select = (type: VehicleType) => {
    onChange(type);
    setOpen(false);
    closeList();
  };

  return (
    <View className="w-full">
      <Pressable
        onPress={toggle}
        className="py-2.5 px-4 border rounded-3xl flex-row items-center justify-between bg-gray-200 border-gray-200"
      >
        <View className="flex-row items-center gap-3">
          {selected && <Text className="text-lg">{selected}</Text>}
          <Text
            className={`font-Jakarta-Medium text-lg ${
              value ? "text-gray-950" : "text-[#ADADAD]"
            }`}
          >
            {value || "Select vehicle type"}
          </Text>
        </View>
        <AppImage
          source={require("@/assets/icons/arrow-down.png")}
          className={`size-5 ${open ? "rotate-180" : ""}`}
          tintColor="#858585"
        />
      </Pressable>

      {mounted && (
        <Animated.View
          className="mt-2 rounded-2xl bg-white border border-general-200 shadow-sm overflow-hidden"
          style={{
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1],
                }),
              },
            ],
          }}
        >
          {Object.values(VehicleType).map((type) => {
            const selectedOption = value === type;
            return (
              <Pressable
                key={type}
                onPress={() => select(type)}
                className={`flex-row items-center gap-3 px-4 py-2.5 ${
                  selectedOption ? "bg-primary-100" : ""
                }`}
              >
                <Text className="text-lg">{vehicleIcons[type] ?? "🚗"}</Text>
                <Text
                  className={`flex-1 text-base font-Jakarta-Medium ${
                    selectedOption ? "text-primary-500" : "text-secondary-900"
                  }`}
                >
                  {type}
                </Text>
                {selectedOption && (
                  <AppImage
                    source={require("@/assets/icons/check.png")}
                    className="size-4"
                    tintColor="#0286ff"
                  />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}
