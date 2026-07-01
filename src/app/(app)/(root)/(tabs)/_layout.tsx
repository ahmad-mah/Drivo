import { AppImage } from "@/shared/components";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabBarIcon = ({ focused, icon }: { focused: boolean; icon: string }) => (
  <View className="flex-1 items-center justify-center">
    <View className={focused ? "rounded-full bg-general-400 p-3" : "p-3"}>
      <AppImage className="size-9" source={icon} />
    </View>
  </View>
);

export default function TabsLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#fff",
        tabBarShowLabel: false,
        animation: "shift",
        tabBarStyle: {
          height: 80,
          backgroundColor: "#333333",
          borderRadius: 50,
          marginHorizontal: 16,

          paddingBottom: 0,
          paddingHorizontal: 10,
          overflow: "hidden",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          position: "absolute",
          bottom: bottom,
        },
        tabBarItemStyle: {
          height: 80,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={require("@/assets/icons/home.png")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={require("@/assets/icons/list.png")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={require("@/assets/icons/chat.png")}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={require("@/assets/icons/profile.png")}
            />
          ),
        }}
      />
    </Tabs>
  );
}
