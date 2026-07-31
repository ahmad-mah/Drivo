import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { UserProvider } from "@/providers/UserProvider";

export default function RootGroupLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/(app)/(auth)/sign-in" />;

  return (
    <UserProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "white" },
        }}
      />
    </UserProvider>
  );
}
