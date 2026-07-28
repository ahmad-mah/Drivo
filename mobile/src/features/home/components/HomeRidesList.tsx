import { FlatList, Text, View } from "react-native";
import { RideItem } from "./RideItem";
import { useRides } from "../hooks/useRides";

export function HomeRidesList() {
  const { rides } = useRides();

  return (
    <View className="gap-3">
      <Text className="font-Jakarta-Bold text-lg">Recent Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.ride_id}
        renderItem={({ item }) => <RideItem item={item} />}
        contentContainerClassName="gap-3"
        scrollEnabled={false}
      />
    </View>
  );
}
