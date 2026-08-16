import { useState } from "react";
import { View } from "react-native";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { goBack } from "@/shared/services/navigation";
import { RideRequestForm } from "../components/RideRequestForm";
import { RideRequestHeader } from "../components/RideRequestHeader";
import { RideRequestMap } from "../components/RideRequestMap";
import { reverseGeocodeAddress } from "../utils/geocode";

export function RideRequestScreen() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const location = useCurrentLocation();

  useErrorSnackbar(locationError);

  const handleUseCurrentLocation = async () => {
    if (!location) return;
    const address = await reverseGeocodeAddress(location);
    if (address) {
      setFrom(address);
    } else {
      setLocationError("Could not get your current location.");
    }
  };

  return (
    <View className="flex-1">
      <View className="absolute inset-0">
        <RideRequestMap location={location} />
      </View>
      <RideRequestHeader onBack={goBack} />
      <View className="flex-1 justify-end">
        <RideRequestForm
          from={from}
          to={to}
          onChangeFrom={setFrom}
          onChangeTo={setTo}
          onUseCurrentLocation={handleUseCurrentLocation}
          onFindNow={() => {
            // TODO: start ride request search (Day 6 backend)
          }}
        />
      </View>
    </View>
  );
}