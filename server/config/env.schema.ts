import { z } from 'zod';

export const envSchema = z.object({
  // === CORE ===
  PORT: z.coerce.number().int().positive().default(5001),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // === DATABASE & CACHE ===
  DATABASE_URL: z.string().url(),
  DATABASE_READONLY_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),

  // === SECURITY & AUTH ===
  SAFE_MODE: z.enum(['on', 'off']).default('on'),
  CONFIRM_CODE: z.string().min(1, 'CONFIRM_CODE must be set for Safe Mode'),
  SESSION_SECRET: z
    .string()
    .min(32, 'Session secret must be at least 32 characters long'),
  COOKIE_DOMAIN: z.string().default('localhost'),

  // === CORS ===
  CORS_ORIGIN: z
    .string()
    .min(1, 'CORS_ORIGIN must be set, comma-separated origins'),

  // === RATE LIMIT ===
  RATE_LIMIT: z.coerce.number().int().positive().default(1000),

  // === PROMETHEUS & METRICS ===
  PROMETHEUS_PORT: z.coerce.number().int().positive().default(9090),
  METRICS_ENABLED: z.string().default('true'),

  // === GOOGLE OAUTH & SERVICES ===
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_SCOPES: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  // Google OAuth — альтернативные имена переменных (для совместимости)
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().url().optional(),

  // === MEDIA PROVIDERS ===
  // === MEDIA PROVIDERS ===
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_VERTEX_PROJECT_ID: z.string().optional(),
  GOOGLE_VERTEX_LOCATION: z.string().default('us-central1'),
  PERPLEXITY_API_KEY: z.string().optional(),
  NANOBANANA_API_KEY: z.string().optional(),

  // === AGENT ROUTING ===
  SOUSCHEF_PROVIDER: z.string().default('openai'),
  SOUSCHEF_MODEL: z.string().default('gpt-4o'),
  GASTROCOUNT_PROVIDER: z.string().default('google'),
  GASTROCOUNT_MODEL: z.string().default('gemini-1.5-pro'),
  GASTROMIND_PROVIDER: z.string().default('perplexity'),
  GASTROMIND_MODEL: z.string().default('sonar'),
  FOODFRAME_IMG_PROVIDER: z.string().default('openai'),
  FOODFRAME_IMG_MODEL: z.string().default('dall-e-3'),
  FOODFRAME_VIDEO_PROVIDER: z.string().default('google'),
  FOODFRAME_VIDEO_MODEL: z.string().default('veo-3'),
  FOODFRAME_UPSCALE_PROVIDER: z.string().default('nanobanana'),

  // === MEDIA FLAGS ===
  ENABLE_UPSCALE_BUTTON: z.coerce.boolean().default(true),
  ENABLE_MODEL_SWITCHER: z.coerce.boolean().default(true),
  ENABLE_VIDEO_GENERATION: z.coerce.boolean().default(true),
  DEFAULT_ASPECT_RATIO: z.string().default('16:9'),

  MEDIA_PROVIDER_DEFAULT: z.string().default('dall-e-3'),
  MEDIA_VIDEO_PROVIDER_DEFAULT: z.string().default('veo-3'),
  ALLOW_MEDIA_FALLBACK: z.string().default('true'),

  // === SMOKE & DEBUG FLAGS ===
  RBAC_SMOKE_ADMIN: z.string().default('0'),
  GOOGLE_AUTH_SMOKE_BYPASS: z.string().default('0'),
});

export type Env = z.infer<typeof envSchema>;
