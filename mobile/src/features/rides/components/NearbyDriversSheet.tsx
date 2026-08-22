import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo } from "react";
import { AppButton } from "@/shared/components";
import type { NearbyDriver } from "../types/ride.types";
import { DriverListItem } from "./DriverListItem";

interface NearbyDriversSheetProps {
  drivers: NearbyDriver[];
  selectedDriverId: string | null;
  onSelectDriver: (driver: NearbyDriver) => void;
  onSelectRide: () => void;
}

/**
 * Minimal bottom sheet listing nearby drivers with a single "Select ride" CTA.
 */
export function NearbyDriversSheet({
  drivers,
  selectedDriverId,
  onSelectDriver,
  onSelectRide,
}: NearbyDriversSheetProps) {
  const insets = useSafeAreaInsets();

  const displayDrivers = useMemo(() => drivers.slice(0, 4), [drivers]);

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
            onPress={() => onSelectDriver(item)}
          />
        )}
      />

      <View className="px-5 pt-4 ">
        <AppButton
          title="Select Ride"
          onPress={onSelectRide}
        />
      </View>
    </View>
  );
}
