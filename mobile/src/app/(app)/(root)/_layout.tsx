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
          contentStyle: { backgroundColor: "#F6F8FA" },
        }}
      >
        <Stack.Screen name="driver-mode" options={{ animation: "fade" }} />
        <Stack.Screen
          name="ride-request"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
    </UserProvider>
  );
}
