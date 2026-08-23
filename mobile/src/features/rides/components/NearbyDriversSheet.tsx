import { FlatList, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { AppButton } from "@/shared/components";
import type { NearbyDriver } from "../types/ride.types";
import { DriverListItem } from "./DriverListItem";
import { CarIcon } from "./CarIcon";

interface NearbyDriversSheetProps {
  drivers: NearbyDriver[];
  /** True until the first driver payload arrives — guards the empty state
   *  so it never flashes while the socket snapshot is still in flight. */
  loading?: boolean;
  selectedDriverId: string | null;
  onSelectDriver: (driver: NearbyDriver) => void;
  onSelectRide: () => void;
}

function EmptyDriversState() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <View className="items-center justify-center rounded-full bg-general-200 size-20">
        <View className="items-center justify-center rounded-full bg-white size-14">
          <CarIcon />
        </View>
      </View>
      <Text className="font-Jakarta-Bold text-2xl text-secondary-900">
        No drivers around yet
      </Text>
      <Text className="text-center font-Jakarta-Medium text-lg text-secondary-400">
        Cars near you appear here in real time the moment they come online.
      </Text>
    </View>
  );
}

/**
 * Bottom sheet listing nearby drivers with a single "Select ride" CTA.
 * The list is socket-fed and stable — rows keep their position while their
 * coordinates update; arrivals and removals animate via LayoutAnimation.
 */
export function NearbyDriversSheet({
  drivers,
  loading = false,
  selectedDriverId,
  onSelectDriver,
  onSelectRide,
}: NearbyDriversSheetProps) {
  const insets = useSafeAreaInsets();

  const displayDrivers = useMemo(() => drivers.slice(0, 4), [drivers]);
  // The CTA only fires for a currently-online selection; if the selected
  // driver went offline the button locks until another driver is picked.
  const selectedIsOnline =
    selectedDriverId != null &&
    displayDrivers.some(
      (driver) => driver.id === selectedDriverId && driver.isOnline !== false,
    );

  const handleSelect = (driver: NearbyDriver) => {
    if (driver.isOnline === false) return;
    onSelectDriver(driver);
  };

  return (
    <View
      className="flex-1 rounded-t-4xl bg-white pt-4 pb-4"
      style={{
        paddingBottom: insets.bottom + 16,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        shadowOpacity: 0.15,
        elevation: 8,
      }}
    >
      {displayDrivers.length > 0 ? (
        <FlatList
          data={displayDrivers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerClassName="gap-3 py-1"
          renderItem={({ item }) => (
            <DriverListItem
              driver={item}
              selected={selectedDriverId === item.id}
              onPress={() => handleSelect(item)}
            />
          )}
        />
      ) : (
        !loading && <EmptyDriversState />
      )}

      <View className="px-5 pt-4 ">
        <AppButton
          title="Select Ride"
          onPress={onSelectRide}
          disabled={!selectedIsOnline}
        />
      </View>
    </View>
  );
}
