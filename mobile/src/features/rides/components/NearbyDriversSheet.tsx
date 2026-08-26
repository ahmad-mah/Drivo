import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { AppButton, AppImage } from "@/shared/components";
import type { NearbyDriver } from "../types/ride.types";
import { DriverListItem } from "./DriverListItem";
import { DriverListSkeleton } from "../skeletons/DriverListSkeleton";

interface NearbyDriversSheetProps {
  drivers: NearbyDriver[];
  loading?: boolean;
  expired?: boolean;
  onPickDriver: (driver: NearbyDriver) => void;
  onTryAgain?: () => void;
}

function SearchingState() {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <View className="size-16 items-center justify-center rounded-full bg-primary-100">
        <ActivityIndicator size="small" color="#0286FF" />
      </View>
      <View className="items-center gap-2">
        <Text className="font-Jakarta-Bold text-base text-secondary-900">
          Finding drivers near you
        </Text>
        <Text className="text-center font-Jakarta text-sm text-secondary-400">
          Hang tight while we search for available rides
        </Text>
      </View>
    </View>
  );
}

function ExpiredState({ onTryAgain }: { onTryAgain?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <View className="size-16 items-center justify-center rounded-full bg-general-200">
        <AppImage
          source={require("@/assets/icons/eyecross.png")}
          className="size-7"
          tintColor="#858585"
        />
      </View>
      <View className="items-center gap-2">
        <Text className="font-Jakarta-Bold text-base text-secondary-900">
          No drivers available
        </Text>
        <Text className="text-center font-Jakarta text-sm text-secondary-400">
          There are no drivers near your location right now. Try again in a
          moment.
        </Text>
      </View>
      {onTryAgain && (
        <View className="mt-2 w-full max-w-[200px]">
          <AppButton title="Try again" onPress={onTryAgain} />
        </View>
      )}
    </View>
  );
}

function DriverListHeader({ count }: { count: number }) {
  return (
    <View className="flex-row items-center justify-between px-1 pb-2 pt-1">
      <Text className="font-Jakarta-SemiBold text-sm text-secondary-500">
        Nearby drivers
      </Text>
      <View className="rounded-full bg-primary-100 px-2.5 py-0.5">
        <Text className="font-Jakarta-Bold text-xs text-primary-600">
          {count}
        </Text>
      </View>
    </View>
  );
}

export function NearbyDriversSheet({
  drivers,
  loading = false,
  expired = false,
  onPickDriver,
  onTryAgain,
}: NearbyDriversSheetProps) {
  const insets = useSafeAreaInsets();
  const displayDrivers = useMemo(() => drivers.slice(0, 4), [drivers]);

  const handleSelect = (driver: NearbyDriver) => {
    if (driver.isOnline === false) return;
    onPickDriver(driver);
  };

  return (
    <View
      className="flex-1 rounded-t-4xl bg-white px-5 pt-4"
      style={{
        paddingBottom: insets.bottom + 16,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.08,
        elevation: 8,
      }}
    >
      {displayDrivers.length > 0 ? (
        <FlatList
          data={displayDrivers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<DriverListHeader count={displayDrivers.length} />}
          contentContainerClassName="gap-2.5 pb-1"
          renderItem={({ item }) => (
            <DriverListItem
              driver={item}
              selected={false}
              onPress={() => handleSelect(item)}
            />
          )}
        />
      ) : loading ? (
        <DriverListSkeleton />
      ) : expired ? (
        <ExpiredState onTryAgain={onTryAgain} />
      ) : (
        <SearchingState />
      )}
    </View>
  );
}
