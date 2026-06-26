import { z } from "zod";
const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default signInSchema;
