import { styled } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

const StyledSafeArea = styled(SafeAreaView);

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function AppSafeArea({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <StyledSafeArea className={cn("flex-1 px-5", className)}>
      {children}
    </StyledSafeArea>
  );
}
