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
          // One unified motion for the whole app: push slides in from the
          // right, pop reverses automatically (native-stack handles it).
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="driver-mode" />
        <Stack.Screen name="ride-request" />
      </Stack>
    </UserProvider>
  );
}
