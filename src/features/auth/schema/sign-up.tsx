import { z } from "zod";
const signUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default signUpSchema;
