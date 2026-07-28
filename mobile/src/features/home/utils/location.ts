import * as Location from "expo-location";

export const requestLocationPermission = async () => {
  const permission = await Location.requestForegroundPermissionsAsync();

  return permission.granted;
};

export const enableHighAccuracy = async () => {
  await Location.enableNetworkProviderAsync();
};

export const startWatchingLocation = async (
  callback: (location: Location.LocationObject) => void,
) => {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 5,
      timeInterval: 1000,
    },
    callback,
  );
};
