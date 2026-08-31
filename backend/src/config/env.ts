import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SIGNING_SECRET is required'),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  PLATFORM_FEE_BPS: z.coerce.number().int().positive().default(2000),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_ROUTES_API_KEY: z.string().optional(),
  DRIVERS_NEARBY_BROADCAST_MS: z.coerce.number().int().positive().default(2000),
  // Kill switch for the simulated fleet (server.ts simulators, rider-map
  // seeding, nearby broadcast). Strict "true"/"false" — z.coerce.boolean()
  // would treat the string "false" as true.
  DISABLE_FAKE_DRIVERS: z
    .preprocess((v) => v === true || v === "true", z.boolean())
    .default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  const { fieldErrors } = parsed.error.flatten();
  for (const [key, messages] of Object.entries(fieldErrors)) {
    console.error(`  ${key}: ${messages?.join(', ')}`);
  }
  process.exit(1);
}

export const env = parsed.data;
