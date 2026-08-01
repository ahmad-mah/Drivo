import { z } from "zod";

const phonePattern = /^\+?[0-9][0-9\s\-().]{6,18}$/;

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || phonePattern.test(value), {
      message: "Enter a valid phone number",
    })
    .optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
