import { describe, it, expect } from 'vitest';
import { envSchema } from '../../server/config/env.schema.js';

describe('Environment Schema Validation', () => {
  it('should pass with valid environment variables', () => {
    const validEnv = {
      PORT: '3000',
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SESSION_SECRET: 'a-very-long-and-secure-session-secret-key',
      SAFE_MODE: 'on',
      CORS_ORIGIN: 'http://localhost:3000',
    };
    const result = envSchema.safeParse(validEnv);
    expect(result.success).toBe(true);
  });

  it('should fail if a required variable is missing', () => {
    const invalidEnv = {
      PORT: '3000',
      // DATABASE_URL is missing
    };
    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
    if (!result.success) {
      const dbUrlError = result.error.issues.find(issue =>
        issue.path.includes('DATABASE_URL')
      );
      expect(dbUrlError).toBeDefined();
    }
  });

  it('should fail if SESSION_SECRET is too short', () => {
    const invalidEnv = {
      PORT: '3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SESSION_SECRET: 'short',
      SAFE_MODE: 'on',
      CORS_ORIGIN: 'http://localhost:3000',
    };
    const result = envSchema.safeParse(invalidEnv);
    expect(result.success).toBe(false);
  });
});
