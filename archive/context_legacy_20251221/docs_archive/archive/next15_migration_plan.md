# План миграции на Next.js 15.x

## 1) Введение и контекст

Данный документ описывает пошаговый, воспроизводимый и проверяемый план миграции текущей версии Next.js на целевую версию Next.js 15.x. План учитывает текущую структуру репозитория и конфигурационные файлы проекта Chef's Mind AI, минимизируя изменения для сохранения обратной совместимости.

**Текущая версия Next.js**: `14.2.5` (из [`frontend-enhanced/package.json`](frontend-enhanced/package.json:1))
**Целевая версия Next.js**: `15.x`
**Минимальная версия Node.js для миграции**: `20.x LTS`
**Порты**:
- UI Development: `3000`
- API Public: `5001` (маппится на `5000` в контейнере)
(подробнее см. [checkpoints/master_checkpoint_2025_10_18.json](checkpoints/master_checkpoint_2025_10_18.json:1))

Проект использует компонент [`BuildBadge`](frontend-enhanced/src/components/build-badge.tsx:1), который отображает версию сборки, основываясь на переменной окружения `NEXT_PUBLIC_BUILD_TS`.

Краткие факты из аудита системы: см. [reports/system_full_audit_summary_2025-10-18T11-13-01.1077660Z.md](reports/system_full_audit_summary_2025-10-18T11-13-01.1077660Z.md:1).

## 2) Инвентаризация текущих конфигов

### 2.1) `next.config.js`

**Before**:
```javascript
// frontend-enhanced/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```
**Planned**:
Миграция на Next.js 15.x не потребует значительных изменений в базовом `next.config.js` файле, если не используются устаревшие экспериментальные флаги. Параметр `reactStrictMode: true` сохранится. Next.js 15.x имеет встроенные оптимизации; явное задание `swcMinify` не рекомендуется, так как оно включено по умолчанию.

### 2.2) `tsconfig.json` (frontend-enhanced)

**Before**:
```json
// frontend-enhanced/tsconfig.json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```
**Planned**:
Для Next.js 15.x рекомендуется обновить `target` до `ES2022` или `ESNext`, `module` до `ESNext`, `moduleResolution` до `"bundler"` (это новый, более производительный режим в TypeScript 5.x, который лучше соответствует поведению сборщиков типа Webpack/Turbopack), и `jsx` до `"react-jsx"`. Также потребуется убедиться, что `baseUrl` и `paths` настроены корректно, если используются абсолютные импорты.

### 2.3) `package.json` (frontend-enhanced)

**Before**:
```json
// frontend-enhanced/package.json
{
  "name": "chefs-mind-ai-enhanced",
  "version": "2.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "socket.io-client": "^4.8.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```
**Planned**:
Обновить `next`, `react`, `react-dom` до последних версий. Обновить `typescript`, `@types/node`, `@types/react`, `@types/react-dom` до совместимых с Next 15.x и React 18.3.x версий. Добавить скрипты `lint` и `typecheck` для более строгой проверки кода. Возможно, потребуется скрипт для генерации `NEXT_PUBLIC_BUILD_TS` в процессе сборки.

### 2.4) Корневой `package.json`

**Before**:
```json
// package.json (фрагменты)
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "NODE_ENV=development tsx watch server/index.ts",
    "dev:client": "cd frontend-enhanced && npm run dev",
    "dev:win": "set NODE_ENV=development&& set PORT=5000&& tsx server/index.ts",
    "build": "cd frontend-enhanced && npm run build",
    "start": "cd frontend-enhanced && npm run start",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "test": "vitest",
    "test:integration": "vitest tests/integration/*.test.ts",
    "test:media": "vitest tests/it/media.spec.ts",
    "test:mcp": "vitest tests/mcp/prompt-enhancer.spec.ts",
    "smoke:media": "sh scripts/smoke-media.sh",
    "smoke:media:auth": "sh scripts/smoke-media-auth.sh",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "prepare": "husky"
  },
  "dependencies": {
    // ...
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    // ...
  },
  "devDependencies": {
    // ...
    "@typescript-eslint/eslint-plugin": "^8.46.1",
    "@typescript-eslint/parser": "^8.46.1",
    "eslint": "^9.37.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-prettier": "^5.5.4",
    "typescript": "5.6.3",
    // ...
  }
}
```
**Planned**:
Обновить зависимости `next`, `react`, `react-dom`, `typescript`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint`, `eslint-config-prettier`, `eslint-plugin-prettier` в корневом `package.json` до версий, совместимых с Next.js 15.x и React 18.3.x, а также с ESLint 9 Flat Config. Скрипты `build` и `start` останутся без изменений, так как они ссылаются на `frontend-enhanced` npm-скрипты.

### 2.5) Конфигурация ESLint

**Before**:
```javascript
// .eslintrc.cjs
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/eslint-recommended',
    '@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'coverage/']
};
```
**Planned**:
ESLint 9 использует Flat Config, поэтому существующий `.eslintrc.cjs` будет устаревать. Потребуется мигрировать на [`eslint.config.js`](eslint.config.js:1) (или `.mjs`) в корне проекта и обновить `eslint-config-next` до версии `^15` для поддержки специфичных для Next.js правил.
Вместо расширения `eslint:recommended`, `@typescript-eslint/eslint-recommended`, `@typescript-eslint/recommended` потребуется использовать новые форматы Flat Config, предоставляемые этими плагинами.

### 2.6) Конфигурация Tailwind/PostCSS

**Before**:
```javascript
// frontend-enhanced/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```
```javascript
// postcss.config.js (корневой)
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```
**Planned**:
Конфигурации PostCSS и Tailwind CSS в целом совместимы с Next.js 15.x. Важно убедиться, что пути `content` в [`tailwind.config.ts`](tailwind.config.ts:1) включают все файлы `frontend-enhanced` для правильной работы Tailwind. В данном случае, это скорее корневая конфигурация, а не специфичная для `frontend-enhanced`. Может потребоваться создание отдельного `tailwind.config.js` в `frontend-enhanced` или корректировка текущего.
Файл [`postcss.config.js`](postcss.config.js:1) в корневой директории также использует `tailwindcss` и `autoprefixer`, что соответствует рекомендациям.

### 2.7) Наличие/отсутствие кастомного webpack и experimental секций

В текущем [`frontend-enhanced/next.config.js`](frontend-enhanced/next.config.js:1) отсутствуют кастомные настройки Webpack и секция `experimental`. Это упрощает миграцию, так как не будет конфликтов с устаревшими опциями или специфичными настройками Webpack.

## 3) Чек-лист несовместимостей и изменений (Next 15.x)

-   **ESLint 9 Flat Config**: Обязателен переход на Flat Config. Текущий `.eslintrc.cjs` несовместим. Потребуется установка `eslint@^9`, `eslint-config-next@^15`, `@eslint/js` и переработка конфигурации в [`eslint.config.js`](eslint.config.js:1) (или `.mjs`).
-   **Turbopack по умолчанию в dev**: Next.js 15.x будет использовать Turbopack по умолчанию в режиме разработки (dev). Для отката на Webpack, если возникнут проблемы совместимости, можно использовать переменную окружения `NEXT_DISABLE_TURBOPACK=1`.
-   **Требования App Router**:
    -   Запрет `next/head`: В App Router `next/head` полностью устарел и должен быть заменен на Metadata API (например, экспортируемые `metadata` или функция `generateMetadata`).
    -   Metadata API и `generateMetadata`: Используется для управления метаданными страницы и SEO, включая `title`, `description`, `opengraph` и т.д. Пример использования можно увидеть в [`frontend-enhanced/app/layout.tsx`](frontend-enhanced/app/layout.tsx:1).
-   **Server Actions (`"use server"`)**: Должны использоваться корректно с директивой `"use server"`. Устаревшие экспериментальные флаги `experimental.serverActions` в `next.config.js` будут удалены.
-   **`next/image`**: Могут быть устаревшие пропсы, которые при обновлении `next/image` потребуют корректировки. Важно проверить использование `layout`, `objectFit`, `lazyBoundary` и заменить их на эквиваленты (например, с использованием `fill`).
-   **React/ReactDOM/TypeScript совместимость**: Next.js 15.x требует `React 18.3.x` и выше. Соответственно, `@types/react` и `@types/react-dom` также должны быть обновлены. `TypeScript ^5.0` является минимальным требованием.
-   **Node.js версия**: Для Next.js 15.x требуется Node.js `20.x LTS` или выше.
-   **Edge/Node runtimes**: Если используются Edge runtimes, необходимо проверить их совместимость с Next.js 15.x.
-   **`tsconfig` paths/aliases с `moduleResolution "Bundler"`**: При использовании `moduleResolution: "Bundler"` в [`tsconfig.json`](frontend-enhanced/tsconfig.json:1) необходимо убедиться, что все пути (paths) и алиасы настроены правильно и совместимы с этим режимом разрешения модулей.
-   **Переменные окружения `NEXT_PUBLIC_*`**: Все публичные переменные окружения должны начинаться с `NEXT_PUBLIC_`. В частности, `NEXT_PUBLIC_BUILD_TS`, используемая в [`BuildBadge`](frontend-enhanced/src/components/build-badge.tsx:1), должна быть проверена.

## 4) Минимальные правки конфигурации с примерами

### 4.1) `next.config.js`

```javascript
// frontend-enhanced/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Отмечать, что swcMinify включен по умолчанию и не требует явного указания
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'example.com', // Заменить на реальный hostname изображений
  //     },
  //   ],
  // },
  // experimental: {
  //   // Устаревшие experimental.serverActions должны быть удалены.
  //   // Turbopack будет включен по умолчанию в dev режиме, не требует explicit flag здесь.
  // },
};

module.exports = nextConfig;
```
**Заметки**: Для `images.remotePatterns` потребуется добавить домены, с которых загружаются изображения. `swcMinify` не следует явно указывать, так как он активен по умолчанию.

### 4.2) `tsconfig.json` (frontend-enhanced)

```json
// frontend-enhanced/tsconfig.json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "bundler", // Изменение
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx", // Изменение
    "target": "es2022", // Изменение
    "baseUrl": ".", // Добавить, если используются абсолютные импорты
    "paths": { // Добавить, если используются алиасы
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"] // Пример
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 4.3) ESLint (`eslint.config.mjs` – пример Flat Config)

```javascript
// eslint.config.mjs (пример для корневой директории)
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";
import nextPlugin from "@next/eslint-plugin"; // Для Next.js 15.x

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Дополнительные правила для Next.js 15.x
      // 'prettier/prettier': 'error', // Если используем Prettier
      // '@typescript-eslint/no-unused-vars': 'error',
      // '@typescript-eslint/no-explicit-any': 'warn'
    },
    settings: {
      react: {
        version: "detect", // Или "18.3"
      },
      next: {
        rootDir: "./frontend-enhanced/", // Уточнить путь
      },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
  {
    ignores: ["node_modules/", ".next/", "dist/", "build/", "coverage/", "frontend-enhanced/.next/"],
  },
];
```

### 4.4) `package.json` (frontend-enhanced) scripts

```json
// frontend-enhanced/package.json (фрагмент)
{
  "name": "chefs-mind-ai-enhanced",
  "version": "2.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint", // Добавить
    "typecheck": "tsc -p ./tsconfig.json --noEmit", // Добавить
    "gen:build-ts": "echo \"export const BUILD_TS = '$(date +%s)';\" > src/build-ts.ts" // Пример, если нужно сгенерировать файл
  },
  // ...
}
```

## 5) Команды установки и порядок запуска

Все команды выполняются из директории `frontend-enhanced`.
1.  **Выбор Node.js 20 LTS**:
    ```bash
    nvm use 20 # Если установлен nvm
    # Иначе вручную убедиться, что используется Node.js 20.x
    ```
2.  **Переход в директорию Next.js приложения**:
    ```bash
    cd frontend-enhanced
    ```
3.  **Обновление зависимостей Next.js и React**:
    ```bash
    npm install -E next@latest react@latest react-dom@latest
    # Или pnpm
    # pnpm update -S next react react-dom
    # Или yarn
    # yarn add next@latest react@latest react-dom@latest
    ```
4.  **Обновление зависимостей TypeScript и ESLint**:
    ```bash
    npm install -D typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest eslint@^9 eslint-config-next@^15 @eslint/js
    # Или pnpm
    # pnpm update -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next @eslint/js
    # Или yarn
    # yarn add --dev typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest eslint@^9 eslint-config-next@^15 @eslint/js
    ```
5.  **Проверка линтером и типами**:
    ```bash
    npm run lint
    npm run typecheck
    ```
6.  **Запуск в режиме разработки (dev) с Turbopack (по умолчанию)**:
    ```bash
    npm run dev
    # Должен быть доступен на http://localhost:3000
    ```
7.  **Запуск в режиме разработки (dev) с Webpack (для отката)**:
    ```bash
    NEXT_DISABLE_TURBOPACK=1 npm run dev
    # Должен быть доступен на http://localhost:3000
    ```
8.  **Сборка и запуск в production режиме**:
    ```bash
    npm run build
    npm run start
    # Должен быть доступен на http://localhost:3000
    ```

## 6) Пошаговый план миграции

1.  **Создание новой ветки и бэкап**:
    ```bash
    git checkout -b feature/nextjs-15-migration d7242c7
    # Создать бэкап текущего состояния проекта перед изменениями.
    ```
2.  **Обновление зависимостей (deps)**:
    -   Перейти в директорию `frontend-enhanced`.
    -   Выполнить команды обновления Next.js/React и TypeScript/ESLint, как описано в разделе 5.
3.  **Правки конфигов**:
    -   Обновить [`frontend-enhanced/next.config.js`](frontend-enhanced/next.config.js:1) (убрать устаревшие experimental флаги, добавить `remotePatterns` для изображений, если необходимо).
    -   Обновить [`frontend-enhanced/tsconfig.json`](frontend-enhanced/tsconfig.json:1) (`target`, `moduleResolution`, `jsx`, `baseUrl`, `paths`).
    -   Мигрировать существующий `.eslintrc.cjs` на новый формат Flat Config в файле [`eslint.config.mjs`](eslint.config.mjs:1) в корне проекта или в `frontend-enhanced` (предпочтительно в корне, если ESLint общая для всего репозитория).
    -   Добавить скрипты `lint` и `typecheck` в [`frontend-enhanced/package.json`](frontend-enhanced/package.json:1).
4.  **Проверка линтером и типами**:
    -   Запустить `npm run lint` и `npm run typecheck` в `frontend-enhanced` для выявления и исправления ошибок.
5.  **Запуск в режиме разработки с Turbopack**:
    -   Запустить `npm run dev` в `frontend-enhanced`.
    -   Исправить все предупреждения и ошибки, связанные с Next.js 15.x и App Router (например, `next/head`).
6.  **Устранение предупреждений и ошибок**:
    -   Исправить проблемы с `next/image` (устаревшие пропсы).
    -   Убедиться в корректности использования Server Actions (директива `"use server"`).
    -   Проверить валидность метаданных страниц (Metadata API).
7.  **Production сборка и запуск**:
    -   Выполнить `npm run build` и `npm run start` в `frontend-enhanced`. Убедиться в отсутствии ошибок.
8.  **Smoke-тесты**:
    -   Выполнить ручные или автоматические smoke-тесты, согласно разделу 7.
9.  **Подготовка Pull Request (PR)**:
    -   Включить в PR логи сборки и тестов, а также описание всех внесенных изменений.

## 7) Тест-план валидации

-   **Development режим**:
    -   Запуск `npm run dev` (в [`frontend-enhanced`](frontend-enhanced/package.json:1)) на порту `3000`.
    -   Навигация по основным страницам приложения без критических ошибок.
    -   Визуальная проверка отображения изображений, загруженных с помощью `next/image`.
-   **Build режим**:
    -   Успешное выполнение `npm run build` (в [`frontend-enhanced`](frontend-enhanced/package.json:1)) без ошибок сборки.
    -   Запуск `npm run start` (в [`frontend-enhanced`](frontend-enhanced/package.json:1)) с успешным стартом приложения.
-   **Переменные окружения**:
    -   Установить переменную окружения `NEXT_PUBLIC_BUILD_TS` в файле `.env.local` в `frontend-enhanced/` (например, `NEXT_PUBLIC_BUILD_TS=20251019`).
    -   Проверить отображение [BuildBadge](frontend-enhanced/src/components/build-badge.tsx:1) в правом нижнем углу с корректным значением.
-   **Функциональность App Router**:
    -   Корректное отображение маршрутов, включая динамические, если они есть.
    -   Проверка работы страниц ошибок (`error.tsx`) и "не найдено" (`not-found.tsx`).
    -   Валидность метаданных страницы через Metadata API (проверить в исходном коде страницы).
    -   Минимальная проверка работы Server Action (если есть в приложении).
-   **API взаимодействие**:
    -   Выполнить `curl` запрос к API для проверки статуса, например: `curl http://localhost:5001/api/health`. URL взять из [checkpoints/master_checkpoint_2025_10_18.json](checkpoints/master_checkpoint_2025_10_18.json:1).
-   **Проверка портов**:
    -   Убедиться, что приложение Next.js запускается на порту `3000`.
    -   Проверить отсутствие конфликтов портов, особенно для `3000`, `5000` и `5001`, согласно [reports/port_conflicts_2025-10-18T11-13-01.1077660Z.txt](reports/port_conflicts_2025-10-18T11-13-01.1077660Z.txt:1).

## 8) Диагностика и откат

-   **Возврат к предыдущему состоянию**:
    -   Если миграция не удалась или возникли необратимые проблемы, можно вернуться к предыдущему стабильному коммиту:
        ```bash
        git checkout d7242c7
        rm -rf frontend-enhanced/.next frontend-enhanced/node_modules
        npm install # в frontend-enhanced/
        ```
-   **Типовые проблемы и решения**:
    -   **ESLint Flat Config**: Если возникают ошибки линтования после обновления, убедитесь, что конфиг `.eslintrc.cjs` был правильно мигрирован в [`eslint.config.mjs`](eslint.config.mjs:1) (или `.js`) и все правила совместимы с ESLint 9.
    -   **Turbopack vs webpack**: Если `next dev` дает сбои с Turbopack, попробуйте `NEXT_DISABLE_TURBOPACK=1 npm run dev` для отката на Webpack. Затем исследуйте проблемы совместимости с Turbopack.
    -   **`next/image` пропсы**: Ошибки, связанные с пропсами `layout`, `objectFit`, `lazyBoundary` указывают на необходимость обновления компонента `Image` до новых API.
    -   **Metadata API**: Если метаданные страницы отображаются некорректно или в консоли есть ошибки, проверьте использование `metadata` объекта или функции `generateMetadata` в файлах `layout.tsx` или `page.tsx`. Убедитесь, что `next/head` не используется.
    -   **`moduleResolution: "Bundler"`**: Ошибки разрешения модулей могут возникнуть, если относительные пути или алиасы `paths` настроены неправильно с новым `moduleResolution` в [`tsconfig.json`](frontend-enhanced/tsconfig.json:1).

## 9) Приложения и диффы

### 9.1) Пример финального `next.config.js`

```javascript
// frontend-enhanced/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Пример добавления удаленных доменов для next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com', // Заменить на реальный hostname изображений
      },
      {
        protocol: 'https',
        hostname: 'another-domain.com',
      },
      // ...
    ],
  },
  // Нет необходимости в experimental.serverActions или явном указании swcMinify
};

module.exports = nextConfig;
```

### 9.2) Пример финального `tsconfig.json`

```json
// frontend-enhanced/tsconfig.json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "incremental": true,
    "module": "esnext",
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "target": "es2022",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    ".next/types/**/*.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### 9.3) Пример `eslint.config.mjs` (Flat Config)

```javascript
// eslint.config.mjs (пример для корневой директории)
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";
import nextPlugin from "@next/eslint-plugin";

export default [
  { 
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: tseslint.parser,
      ecmaVersion: 2020, // или 2022, или 'latest'
      sourceType: "module",
      parserOptions: {
        project: ["./tsconfig.json", "./frontend-enhanced/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    } 
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // 'prettier/prettier': 'error', // Пример Prettier правила
      // '@typescript-eslint/no-unused-vars': 'error',
      // '@typescript-eslint/no-explicit-any': 'warn'
    },
    settings: {
      react: {
        version: "detect", 
      },
      next: {
        rootDir: "./frontend-enhanced/", 
      },
    },
  },
  {
    ignores: ["node_modules/", ".next/", "dist/", "build/", "coverage/", "frontend-enhanced/.next/"],
  },
];
```

### 9.4) Фрагмент `package.json` scripts

```json
// frontend-enhanced/package.json (фрагмент)
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "typecheck": "tsc -p ./tsconfig.json --noEmit",
    "gen:build-ts": "echo \"export const BUILD_TS = '$(date +%s)';\" > src/build-ts.ts"
  },
}
```

### 9.5) Ссылки на использованные артефакты

-   Отчет аудита системы: [reports/system_full_audit_summary_2025-10-18T11-13-01.1077660Z.md](reports/system_full_audit_summary_2025-10-18T11-13-01.1077660Z.md:1)
-   Чекпоинт проекта: [checkpoints/master_checkpoint_2025_10_18.json](checkpoints/master_checkpoint_2025_10_18.json:1)
-   Отчет о конфликтах портов: [reports/port_conflicts_2025-10-18T11-13-01.1077660Z.txt](reports/port_conflicts_2025-10-18T11-13-01.1077660Z.txt:1)