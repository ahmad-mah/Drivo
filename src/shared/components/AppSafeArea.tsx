import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppSafeArea = ({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) => {
  return (
    <SafeAreaView style={style} className={className}>
      {children}
    </SafeAreaView>
  );
};

export default AppSafeArea;
