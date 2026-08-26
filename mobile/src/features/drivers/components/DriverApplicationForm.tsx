import { View, Text } from "react-native";
import { AppFormField, AppGap } from "@/shared/components";
import { VehicleTypePicker } from "./VehicleTypePicker";
import type { DriverApplicationFormData } from "../types/driver.types";

type FieldConfig = {
  name: keyof DriverApplicationFormData;
  title: string;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad";
  inputMode?: "text" | "tel";
};

const vehicleFields: FieldConfig[] = [
  {
    name: "vehicleModel",
    title: "Vehicle Model",
    placeholder: "e.g. Camry, Model 3",
    autoCapitalize: "words",
  },
  {
    name: "vehicleColor",
    title: "Vehicle Color",
    placeholder: "e.g. White, Black",
    autoCapitalize: "words",
  },
  {
    name: "seats",
    title: "Car Seats",
    placeholder: "e.g. 4",
    keyboardType: "phone-pad" as const,
    inputMode: "text" as const,
  },
  {
    name: "vehiclePlate",
    title: "Vehicle Plate",
    placeholder: "License plate number",
    autoCapitalize: "characters",
  },
  {
    name: "licenseNumber",
    title: "License Number",
    placeholder: "Driver's license number",
    autoCapitalize: "characters",
  },
];

export function DriverApplicationForm() {
  return (
    <View className="rounded-2xl bg-white p-5 shadow-sm">
      <Text className="text-lg font-Jakarta-Bold text-secondary-900">
        Vehicle Details
      </Text>
      <AppGap height={16} />

      <View className="gap-4">
        <View className="w-full">
          <Text className="text-lg">Vehicle Type</Text>
          <AppGap height={8} />
          <AppFormField name="vehicleType">
            {({ value, onChange }) => (
              <VehicleTypePicker value={value ?? ""} onChange={onChange} />
            )}
          </AppFormField>
        </View>

        {vehicleFields.map((field) => (
          <AppFormField
            key={field.name}
            name={field.name}
            title={field.title}
            placeholder={field.placeholder}
            autoCapitalize={field.autoCapitalize}
            keyboardType={field.keyboardType}
            inputMode={field.inputMode}
          />
        ))}
      </View>
    </View>
  );
}
