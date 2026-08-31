import {
  TAB_BAR_GAP,
  TAB_BAR_HEIGHT,
} from "@/shared/constants/tabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Bottom padding a tab screen needs so the floating tab bar never covers it.
 * The bar sits at the safe-area inset with a fixed height, so the clearance is
 * height + gap + bottom inset.
 */
export function useTabBarBottomInset() {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + TAB_BAR_GAP + bottom;
}
