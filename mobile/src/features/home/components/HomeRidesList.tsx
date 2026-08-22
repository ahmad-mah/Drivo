import { FlatList, Text, View } from "react-native";
import { RideItem } from "./RideItem";
import { RideItemSkeleton } from "../skeletons/RideItemSkeleton";
import { useRides } from "../hooks/useRides";

const SKELETON_ROWS = [0, 1, 2];

export function HomeRidesList() {
  const { rides, loading, error } = useRides();

  return (
    <View className="gap-3">
      <Text className="font-Jakarta-Bold text-lg">Recent Rides</Text>
      {loading ? (
        <View className="gap-3">
          {SKELETON_ROWS.map((key) => (
            <RideItemSkeleton key={key} />
          ))}
        </View>
      ) : error ? (
        <View className="rounded-xl bg-white px-4 py-6">
          <Text className="font-Jakarta text-center text-secondary-400">
            Couldn&apos;t load your recent rides.
          </Text>
        </View>
      ) : rides.length === 0 ? (
        <View className="rounded-xl bg-white px-4 py-6">
          <Text className="font-Jakarta text-center text-secondary-400">
            No rides yet. Your completed trips will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RideItem item={item} />}
          contentContainerClassName="gap-3"
          scrollEnabled={false}
        />
      )}
    </View>
  );
}