import { ScrollView } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { HomeWelcome } from "../components/HomeWelcome";
import { HomeSearch } from "../components/HomeSearch";
import { HomeMap } from "../components/HomeMap";
import { HomeRidesList } from "../components/HomeRidesList";
import { AppSafeArea, AppGap } from "@/shared/components";

export default function HomeScreen() {
  const { user } = useCurrentUser();
  const signOut = useSignOut();

  return (
    <AppSafeArea>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <AppGap height={20} />
        <HomeWelcome userName={user?.firstName ?? undefined} onSignOut={signOut} />
        <AppGap height={16} />
        <HomeSearch />
        <AppGap height={20} />
        <HomeMap />
        <AppGap height={24} />
        <HomeRidesList />
      </ScrollView>
    </AppSafeArea>
  );
}
