import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { AppGap } from "@/shared/components";

interface DriverDetailsCardProps {
  title: string;
  children: ReactNode;
}

/** White card shell for a driver-profile details section (e.g. Vehicle, Driver). */
export function DriverDetailsCard({ title, children }: DriverDetailsCardProps) {
  return (
    <View className="rounded-2xl bg-white p-5 shadow-sm">
      <Text className="text-lg font-Jakarta-Bold text-secondary-900">
        {title}
      </Text>
      <AppGap height={12} />
      {children}
    </View>
  );
}
