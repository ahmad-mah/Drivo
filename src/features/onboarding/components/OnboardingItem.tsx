import { View, Text } from "react-native";
import { AppImage } from "@/shared/components";
import type { OnboardingSlide } from "../constants/constants";

const OnboardingItem = ({
  item,
  width,
}: {
  item: OnboardingSlide;
  width: number;
}) => {
  return (
    <View style={{ width: width * 0.9, gap: 20 }}>
      <AppImage source={item.image} className="h-[300] object-contain" />

      <Text className="font-Jakarta-Bold text-4xl text-center leading-relaxed text-secondary-900">
        {item.title}
        {item.id === "1" && <Text className="text-primary-500">Drivo</Text>}
      </Text>

      <Text className="font-Jakarta-SemiBold text-xl text-secondary-500 text-center">
        {item.subtitle}
      </Text>
    </View>
  );
};

export default OnboardingItem;
