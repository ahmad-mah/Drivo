import { styled } from "nativewind";
import { Image as ExpoImage } from "expo-image";
import type { ImageProps } from "expo-image";

const StyledImage = styled(ExpoImage);

export function AppImage(props: ImageProps & { className?: string }) {
  return <StyledImage {...props} />;
}
