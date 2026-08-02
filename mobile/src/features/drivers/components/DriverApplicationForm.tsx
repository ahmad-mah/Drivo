import { View, Text } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { AppTextInput, AppGap } from "@/shared/components";
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

const renderField = (
  field: FieldConfig,
  control: Control<DriverApplicationFormData>,
  errors: FieldErrors<DriverApplicationFormData>,
) => (
  <View key={field.name} className="w-full">
    <AppTextInput
      control={control}
      name={field.name}
      title={field.title}
      placeholder={field.placeholder}
      autoCapitalize={field.autoCapitalize}
      keyboardType={field.keyboardType}
      inputMode={field.inputMode}
    />
    {errors[field.name]?.message && (
      <Text className="text-red-500 text-sm mt-1 ml-2">
        {errors[field.name]?.message}
      </Text>
    )}
  </View>
);

export function DriverApplicationForm() {
  const { control, formState: { errors } } = useFormContext<DriverApplicationFormData>();
  const vehicleTypeError = errors.vehicleType?.message;

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
          <Controller
            control={control}
            name="vehicleType"
            render={({ field }) => (
              <VehicleTypePicker
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
          {vehicleTypeError && (
            <Text className="text-red-500 text-sm mt-1 ml-2">
              {vehicleTypeError}
            </Text>
          )}
        </View>

        {vehicleFields.map((field) => renderField(field, control, errors))}
      </View>
    </View>
  );
}
