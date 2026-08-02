import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { ProfileInfoForm } from "@/features/profile/components/ProfileInfoForm";
import { ProfileDriverSection } from "@/features/profile/components/ProfileDriverSection";
import { ProfileSkeleton } from "@/features/profile/components/ProfileSkeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSignOut } from "@/hooks/useSignOut";
import { AppButton, AppGap, AppSafeArea } from "@/shared/components";

export default function ProfileScreen() {
  const { user } = useCurrentUser();
  const handleSignOut = useSignOut();
  const { bottom } = useSafeAreaInsets();

  if (!user) return <ProfileSkeleton />;

  return (
    <AppSafeArea>
      <ScrollView
        className="flex-1"
        style={{ paddingBottom: 0 }}
        // keep bottom content clear of the floating tab bar (height 50 + inset)
        contentContainerStyle={{ paddingBottom: 50 + bottom}}
        showsVerticalScrollIndicator={false}
      >
        <AppGap height={20} />

        <Text className="text-2xl font-Jakarta-Bold text-secondary-900">
          Your Profile
        </Text>

        <AppGap height={18} />

        <ProfileAvatar imageUrl={user.imageUrl} />

        <AppGap height={24} />

        <ProfileInfoForm user={user} />

        <View className="mt-6">
          <ProfileDriverSection />
        </View>

        <View className="mt-8">
          <AppButton
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
          />
        </View>
      </ScrollView>
    </AppSafeArea>
  );
}
