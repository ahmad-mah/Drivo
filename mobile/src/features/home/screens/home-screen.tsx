import { ScrollView } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSignOut } from "@/features/auth/hooks/useSignOut";
import { HomeWelcome } from "../components/HomeWelcome";
import { HomeSearch } from "../components/HomeSearch";
import { HomeMap } from "../components/HomeMap";
import { HomeRidesList } from "../components/HomeRidesList";
import { DriverStatusBanner } from "@/features/drivers/components/DriverStatusBanner";
import { useDriverApplication } from "@/features/drivers/hooks/useDriverApplication";
import { goToBecomeDriver } from "@/shared/services/navigation";
import { AppSafeArea, AppGap } from "@/shared/components";

export default function HomeScreen() {
  const { user } = useCurrentUser();
  const signOut = useSignOut();
  const { application } = useDriverApplication();

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
        {application && (
          <>
            <DriverStatusBanner
              application={application}
              onReapply={goToBecomeDriver}
              onChangeVehicle={goToBecomeDriver}
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
