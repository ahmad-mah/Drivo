import { View } from "react-native";

const AppGap = ({ height, width }: { height?: number; width?: number }) => {
  return <View style={{ height: height, width: width }}></View>;
};

export default AppGap;
