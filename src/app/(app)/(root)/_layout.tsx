import { Stack } from "expo-router";

export default function RootGroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    />
  );
}
