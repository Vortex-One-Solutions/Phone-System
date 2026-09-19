import { z } from 'zod';

export const config = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  PUBLIC_API_ORIGIN: z.string().url().default('http://localhost:3001'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(604800),
  PASSWORD_RESET_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  EMAIL_VERIFICATION_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  MFA_ENCRYPTION_KEY: z.string().min(1),
  TELEPHONY_ENCRYPTION_KEY: z.string().min(1).optional(),
  TELNYX_WEBHOOK_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(300),
  LOG_LEVEL: z.string().default('info'),
}).parse(process.env);

[executed on device: codespaces-73d925 (e215b2d9-1319-4805-9ed4-b434928d4042)]