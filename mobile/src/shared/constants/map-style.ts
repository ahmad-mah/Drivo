import type { MapStyleElement } from "react-native-maps";

/**
 * App-wide default map look: minimal, label-free except road names, on a
 * light gray palette. Every map in the app should render with this style.
 */
export const DEFAULT_MAP_STYLE: MapStyleElement[] = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    stylers: [{ visibility: "off" }],
  },
  // Show road names
  {
    featureType: "road",
    elementType: "labels.text",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#E5E5E5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#E5E5E5" }],
  },
];
