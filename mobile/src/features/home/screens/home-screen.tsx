import { ScrollView } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSignOut } from "@/hooks/useSignOut";
import { HomeWelcome } from "../components/HomeWelcome";
import { HomeSearch } from "../components/HomeSearch";
import { HomeMap } from "../components/HomeMap";
import { HomeRidesList } from "../components/HomeRidesList";
import { DriverStatusCard } from "@/features/drivers/components/DriverStatusCard";
import { GoDriveCard } from "@/features/drivers/components/GoDriveCard";
import { useDriverApplication } from "@/features/drivers/hooks/useDriverApplication";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { goToDriverProfile } from "@/shared/services/navigation";
import { AppSafeArea, AppGap } from "@/shared/components";
import { useTabBarBottomInset } from "@/shared/hooks/useTabBarBottomInset";
import { HomeScreenSkeleton } from "../skeletons/HomeScreenSkeleton";

export default function HomeScreen() {
  const { user, loading: userLoading } = useCurrentUser();
  const { handleSignOut } = useSignOut();
  const { application, loading: applicationLoading } = useDriverApplication();
  const tabBarInset = useTabBarBottomInset();

  if (userLoading || applicationLoading) return <HomeScreenSkeleton />;

  return (
    <AppSafeArea>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
      >
        <AppGap height={20} />
        <HomeWelcome userName={user?.firstName ?? undefined} onSignOut={handleSignOut} />
        <AppGap height={16} />
        {application && (
          <>
            {application.approvalStatus === DriverApprovalStatus.APPROVED ? (
              <GoDriveCard />
            ) : (
              <DriverStatusCard
                application={application}
                onPress={goToDriverProfile}
              />
            )}
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
