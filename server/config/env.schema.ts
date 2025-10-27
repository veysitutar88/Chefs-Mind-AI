import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  DATABASE_READONLY_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters long'),
  SAFE_MODE: z.enum(['on', 'off']).default('on'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN must be set, comma-separated origins'),
});

export type Env = z.infer<typeof envSchema>;