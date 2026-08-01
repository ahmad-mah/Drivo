import { z } from "zod";

const phonePattern = /^\+?[0-9][0-9\s\-().]{6,18}$/;

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || phonePattern.test(value), {
      message: "Enter a valid phone number",
    }),
});

export type ProfileFormValues = z.infer<typeof updateProfileSchema>;
