import { z } from "zod";
import signUpSchema from "../schema/sign-up";
import signInSchema from "../schema/sign-in";

type SignUpForm = z.infer<typeof signUpSchema>;
type SignInForm = z.infer<typeof signInSchema>;

export { SignUpForm, SignInForm };
