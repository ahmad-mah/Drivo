import type { ProfileFormValues } from "@/features/profile/schema/profile.schema";

export type FieldConfig = {
  name: keyof ProfileFormValues;
  title: string;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "email-address";
  inputMode?: "text" | "tel" | "email";
};

export const profileFormFields: FieldConfig[] = [
  {
    name: "firstName",
    title: "First Name",
    placeholder: "Enter your first name",
    autoCapitalize: "words",
  },
  {
    name: "lastName",
    title: "Last Name",
    placeholder: "Enter your last name",
    autoCapitalize: "words",
  },
  {
    name: "phone",
    title: "Phone",
    placeholder: "Enter your phone number",
    keyboardType: "phone-pad",
    inputMode: "tel",
  },
];