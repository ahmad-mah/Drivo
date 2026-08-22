import { Pressable, Text } from "react-native";
import { AppImage } from "@/shared/components";
import { goToRideRequest } from "@/shared/services/navigation";

export function HomeSearch() {
  return (
    <Pressable
      className="flex-row items-center gap-3 rounded-full bg-white px-5 py-4"
      onPress={goToRideRequest}
    >
      <AppImage
        className="size-7"
        source={require("@/assets/icons/search.png")}
      />
      <Text className="font-Jakarta text-base text-[#ADADAD] text-[15px]">
        Where do you want to go?
      </Text>
    </Pressable>
  );
}
