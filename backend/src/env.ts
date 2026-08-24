import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_PRIVATE_KEY_BASE64: z
    .string()
    .min(1)
    .transform((v) => Buffer.from(v, 'base64').toString('utf8')),
  JWT_PUBLIC_KEY_BASE64: z
    .string()
    .min(1)
    .transform((v) => Buffer.from(v, 'base64').toString('utf8')),
  // 32 random bytes as 64 hex chars
  FIELD_ENCRYPTION_KEY: z.string().length(64, 'Must be 64 hex chars (32 bytes)'),
  FIELD_HMAC_KEY: z.string().length(64, 'Must be 64 hex chars (32 bytes)'),
  CORS_ORIGIN: z.string().default('http://localhost:8081'),
  REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().int().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
