import { styled } from "nativewind";
import MapView from "react-native-maps";
import type { ReactNode } from "react";

const StyledMapView = styled(MapView);

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppMapView({
  children,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof MapView> & {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <StyledMapView className={cn("w-full", className)} {...props}>
      {children}
    </StyledMapView>
  );
}
