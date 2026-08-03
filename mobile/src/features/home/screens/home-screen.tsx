import { ScrollView } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSignOut } from "@/hooks/useSignOut";
import { HomeWelcome } from "../components/HomeWelcome";
import { HomeSearch } from "../components/HomeSearch";
import { HomeMap } from "../components/HomeMap";
import { HomeRidesList } from "../components/HomeRidesList";
import { DriverStatusCard } from "@/features/drivers/components/DriverStatusCard";
import { useDriverApplication } from "@/features/drivers/hooks/useDriverApplication";
import { goToDriverProfile } from "@/shared/services/navigation";
import { AppSafeArea, AppGap } from "@/shared/components";

export default function HomeScreen() {
  const { user } = useCurrentUser();
  const { handleSignOut } = useSignOut();
  const { application } = useDriverApplication();

  return (
    <AppSafeArea>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <AppGap height={20} />
        <HomeWelcome userName={user?.firstName ?? undefined} onSignOut={handleSignOut} />
        <AppGap height={16} />
        {application && (
          <>
            <DriverStatusCard
              application={application}
              onPress={goToDriverProfile}
            />
            <AppGap height={16} />
          </>
        )}
        <HomeSearch />
        <AppGap height={20} />
        <HomeMap />
        <AppGap height={24} />
        <HomeRidesList />
      </ScrollView>
    </AppSafeArea>
  );
}
