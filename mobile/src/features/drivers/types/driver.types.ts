import type { z } from "zod";
import type { applyDriverSchema } from "../schema/driver.schema";

export type DriverApplicationFormData = z.infer<typeof applyDriverSchema>;
