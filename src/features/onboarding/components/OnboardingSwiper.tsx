import { View, FlatList } from "react-native";
import OnboardingItem from "./OnboardingItem";
import type { OnboardingSlide } from "../constants/constants";

const OnboardingSwiper = ({
  flatListRef,
  data,
  width,
  onScrollEnd,
}: {
  flatListRef: React.RefObject<FlatList<OnboardingSlide> | null>;
  data: OnboardingSlide[];
  width: number;
  onScrollEnd: (event: any) => void;
}) => {
  return (
    <View className="h-[515]">
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <OnboardingItem item={item} width={width} />}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onScrollEnd}
      />
    </View>
  );
};

export default OnboardingSwiper;
