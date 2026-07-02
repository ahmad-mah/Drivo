import { styled } from 'nativewind';
import { View } from 'react-native';

const Base = styled(View);

const AppGap = ({ height, width }: { height?: number; width?: number }) => {
  return <Base style={{ height, width }} />;
};

export { AppGap };
