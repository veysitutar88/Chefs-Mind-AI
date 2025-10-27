import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedDir = path.resolve(__dirname, 'shared');

export default defineConfig({
  resolve: {
    alias: [
      // Алиасы соответствуют TS paths: относительные импорты с .js, алиасы — без расширений
      { find: '@shared/schema', replacement: path.join(sharedDir, 'schema.ts') },
      { find: '@shared/schema.js', replacement: path.join(sharedDir, 'schema.ts') },
      { find: '@shared', replacement: sharedDir },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts', 'server/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'tests/integration/**'],
    environment: 'node',
  },
});