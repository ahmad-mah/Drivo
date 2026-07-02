import { Text, View } from "react-native";
import { useAuth } from "@clerk/expo";
import { AppButton } from "@/shared/components";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold">Profile</Text>
      <View className="absolute bottom-10 w-full px-6">
        <AppButton
          title="Sign Out"
          //it should be handled auto by the hook of sign out
          //  using the checks at the beginning of the app
          onPress={() => {
            signOut().then(() => {
              if (router.canDismiss()) {
                router.dismissAll();
              }
              router.replace("/welcome");
            });
          }}
        />
      </View>
    </View>
  );
}
