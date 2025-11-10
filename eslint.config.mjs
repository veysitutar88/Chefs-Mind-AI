import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
// Плагины установлены, но на первом цикле не включаем строгие правила:
// import importX from 'eslint-plugin-import-x';
// import unusedImports from 'eslint-plugin-unused-imports';
// import simpleImportSort from 'eslint-plugin-simple-import-sort';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  // Игноры на уровне корня
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      'coverage/**',
      'reports/**',
      'logs/**',
      'drizzle/migrations/meta/**',
      'out/**',
      'tmp/**',
      'uploads/**',
      '**/*.tsbuildinfo'
    ]
  },

  // Базовые рекомендации для JS
  js.configs.recommended,

  // Рекомендации для TypeScript
  ...tseslint.configs.recommended,

  // Глобальные настройки для TS/ESM (минимальные правила)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    rules: {
      // Минимальный baseline без усиления.
      // Политика проекта: ESM Above All — относительные импорты в .ts оканчиваются на .js.
      // Не включаем строгую проверку сейчас; будет добавлена на следующем цикле.
    }
  },

  // Backend / Shared / Tests — Node окружение
  {
    files: [
      'server/**/*.{ts,tsx,js,mjs}',
      'shared/**/*.{ts,tsx,js,mjs}',
      'tests/**/*.{ts,tsx,js,mjs}'
    ],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {}
  },

  // Frontend пакеты — браузерное окружение
  {
    files: [
      'frontend/**/*.{ts,tsx,js,mjs}',
      'frontend-enhanced/**/*.{ts,tsx,js,mjs}',
      'frontend-simple/**/*.{ts,tsx,js,mjs}'
    ],
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // Минимальный baseline без строгих правил React/Next на первом цикле.
    }
  }
];