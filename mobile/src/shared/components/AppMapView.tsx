import { styled } from "nativewind";
import MapView from "react-native-maps";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";
import { DEFAULT_MAP_STYLE } from "@/shared/constants/map-style";

const StyledMapView = styled(MapView);

export function AppMapView({
  children,
  className,
  showsBuildings = false,
  showsTraffic = false,
  showsIndoorLevelPicker = false,
  toolbarEnabled = false,
  moveOnMarkerPress = false,
  customMapStyle = DEFAULT_MAP_STYLE,
  ...props
}: React.ComponentPropsWithRef<typeof MapView> & {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <StyledMapView
      className={cn("w-full", className)}
      showsBuildings={showsBuildings}
      showsTraffic={showsTraffic}
      showsIndoorLevelPicker={showsIndoorLevelPicker}
      toolbarEnabled={toolbarEnabled}
      moveOnMarkerPress={moveOnMarkerPress}
      customMapStyle={customMapStyle}
      {...props}
    >
      {children}
    </StyledMapView>
  );
}
