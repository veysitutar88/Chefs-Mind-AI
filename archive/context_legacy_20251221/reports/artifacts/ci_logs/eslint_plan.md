# ESLint Flat-Config (ESLint 9) — План миграции/исправления для Chef's Mind AI

Этот документ описывает план унификации ESLint на flat-config для моно-репо ESM/TS с бэкендом и несколькими фронтендами (Next). Реализация без изменения прикладного кода; только конфигурация и скрипты.

Ссылки на контекст: [lint.log](reports/artifacts/ci_logs/lint.log:1), [eslint.config.mjs](eslint.config.mjs:1), [eslint.config.js](eslint.config.js:1), [package.json](package.json:1), [frontend-enhanced/package.json](frontend-enhanced/package.json:1), [frontend/next.config.js](frontend/next.config.js:1), [frontend-enhanced/next.config.js](frontend-enhanced/next.config.js:1), [frontend-simple/next.config.js](frontend-simple/next.config.js:1).

Overview
- Причина падения: в логе R2 ESLint 9 пытается импортировать @eslint/js из [eslint.config.mjs](eslint.config.mjs:1), но модуль не найден:
  - Цитата: ESLint 9.39.1 → Error ERR_MODULE_NOT_FOUND: Cannot find package '@eslint/js' imported from [eslint.config.mjs](eslint.config.mjs:1) ([lint.log](reports/artifacts/ci_logs/lint.log:10)).
- При этом в корневом [package.json](package.json:141) @eslint/js присутствует как devDependency. Вероятные причины:
  - devDependencies не были установлены на этапе CI (например, npm ci --omit=dev или NODE_ENV=production до шага линта).
  - Несогласованность рабочих директорий/воркспейсов и разрешения модулей (моно-репо, отдельные пакеты фронтенда).
- Почему нужна унификация flat-config:
  - ESLint 9 официально поддерживает flat-config; плагинный стек активно мигрирует на него.
  - В репозитории одновременно есть [eslint.config.mjs](eslint.config.mjs:1) и легаси [eslint.config.js](eslint.config.js:1) → источник неоднозначности.
  - Требования проекта к ESM и TS (включая правило ESM Above All: расширение .js в относительных импортах) проще централизованно зафиксировать в flat-config.

Target deps (минимальный согласованный набор)
Обязательные:
- eslint@^9.39.1
- @eslint/js@^9.39.1
- typescript@^5.9.3
- typescript-eslint@^8.46.3 (агрегатор для flat-config: импорт tseslint из "typescript-eslint")

Импорт/резолв и ESM/TS:
- Вариант A — eslint-plugin-import-x@^4 + eslint-import-resolver-typescript@^3
  - Рекомендовано. Форк classic import с лучшей поддержкой TS/ESM и стабильной работой в flat-config. Упрощает резолв .js против .ts при ESM.
- Вариант B — eslint-plugin-import@^2 + eslint-import-resolver-typescript@^3
  - Допустимо, но чаще требует дополнительных исключений/настроек при ESM+TS+flat-config, особенно при политике ".js в TS".

Полезные плагины (опционально, но рекомендовано):
- eslint-plugin-unused-imports@^4
- eslint-plugin-simple-import-sort@^12
- eslint-plugin-react@^7, eslint-plugin-react-hooks@^5 (для React-кода)
- @next/eslint-plugin-next@^15 (для Next; см. заметки о совместимости)
- globals@^16 (набор окружений для flat-config)

Совместимость Next:
- eslint-config-next@^15.5.6 присутствует, но исторически экспортирует не flat-конфиг. Для flat-конфига безопаснее использовать @next/eslint-plugin-next и явно включить правила в overrides.
- Открытый вопрос: оставить eslint-config-next для compatibility-режима или полностью перейти на @next/eslint-plugin-next. См. раздел Open items.

Proposed eslint.config.mjs (черновик, единый корневой)
Внимание: это проект черновика, применять после установки зависимостей. Не вносит изменений в код. Сегменты покрывают общий слой, сервер/шареды и Next-пакеты.

```js
// eslint.config.mjs — flat-config, ESM
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importX from "eslint-plugin-import-x";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

const tsProjects = [
  "./tsconfig.json",
  "./frontend/tsconfig.json",
  "./frontend-enhanced/tsconfig.json",
  "./frontend-simple/tsconfig.json",
];

export default tseslint.config(
  // 0) Игноры на уровне репозитория
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      "frontend-enhanced/.next/**",
      "frontend/.next/**",
      "frontend-simple/.next/**",
      "coverage/**",
      "reports/**",
      "logs/**",
      "drizzle/migrations/meta/**",
      "out/**",
      "tmp/**",
      "uploads/**",
    ],
  },

  // 0.1) Базовые рекомендованные наборы
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 1) База для всех файлов
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2024,
      },
    },
    plugins: {
      "import-x": importX,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          project: tsProjects,
          alwaysTryTypes: true,
        },
        node: {
          extensions: [".js", ".mjs", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // ESM Above All: относительные импорты должны оканчиваться на .js|.mjs|.cjs
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^\\.+\\/(?!.*\\.(js|mjs|cjs)$).*/]",
          message: "ESM Above All: добавляйте расширение .js в относительных импортах.",
        },
      ],

      // Полезные практики импорта
      "import-x/no-unresolved": ["error", { extensions: [".js", ".mjs", ".ts", ".tsx"] }],
      "unused-imports/no-unused-imports": "error",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },

  // 2) TypeScript с типо-осведомленным анализом (server, shared, tests)
  {
    files: ["server/**/*.{ts,tsx}", "shared/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsProjects,
        tsconfigRootDir: new URL(".", import.meta.url),
      },
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },
    // Дополнительные node-специфичные правила можно добавить здесь при необходимости
    rules: {},
  },

  // 3) Next.js фронтенды (frontend, frontend-enhanced, frontend-simple)
  {
    files: [
      "frontend/**/*.{ts,tsx,js,mjs}",
      "frontend-enhanced/**/*.{ts,tsx,js,mjs}",
      "frontend-simple/**/*.{ts,tsx,js,mjs}",
    ],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.es2024,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Пример включения нескольких правил Next
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/google-font-display": "warn",
    },
  }
);
```

Примечания к черновику:
- Раздел 2 включает type-checked анализ только для server/shared/tests, чтобы не тормозить фронтенды из-за сложных tsconfig цепочек.
- Правило no-restricted-syntax реализует требование проекта про .js в относительных импортах без конфликтов с TS.
- Раздел 3 использует @next/eslint-plugin-next вместо eslint-config-next для совместимости с flat-config.

Scripts (фрагмент для секции "scripts" [package.json](package.json:6))
Вставить или заменить команды; не выполнять автоматически.

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.mjs --max-warnings=0",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.mjs --fix",
    "lint:server": "eslint server shared tests --ext .ts,.tsx,.js,.mjs --max-warnings=0",
    "lint:fe": "eslint frontend frontend-enhanced frontend-simple --ext .ts,.tsx,.js,.mjs --max-warnings=0"
  }
}
```

Инструкция по применению скриптов:
- Заменить текущие lint-скрипты в [package.json](package.json:33) на указанные выше.
- Для локального прогона на Windows PowerShell:
  - npm run lint
- Для Unix/macOS bash/zsh:
  - npm run lint

CI usage (R2)
- Установка зависимостей:
  - npm ci  ← важно: без --omit=dev (ESLint и плагины находятся в devDependencies)
- Линт:
  - npm run lint 2>&1 | tee reports/artifacts/ci_logs/eslint_latest.log
- Публикуемые артефакты:
  - [reports/artifacts/ci_logs/eslint_latest.log](reports/artifacts/ci_logs/eslint_latest.log:1)
  - [reports/artifacts/ci_logs/lint.log](reports/artifacts/ci_logs/lint.log:1) (можно оставить для обратной совместимости либо заменить на новый путь)
- Пример шага в CI:
  - name: Lint
    run: |
      npm ci
      npm run lint 2>&1 | tee reports/artifacts/ci_logs/eslint_latest.log

Windows/Unix нотации путей
- Все пути в конфиге используют прямые слэши; ESLint и Node обрабатывают их кроссплатформенно.
- В PowerShell перенаправление вывода отличается; используйте команду из примера выше. Для cmd.exe: npm run lint > reports\\artifacts\\ci_logs\\eslint_latest.log 2&>1

Risk & Rollback
- Откат зависимостей:
  - Сохранить текущий lockfile; при необходимости вернуть: git checkout -- package-lock.json && npm ci
- Откат конфигурации:
  - Вернуть прежние версии [eslint.config.mjs](eslint.config.mjs:1) и/или [eslint.config.js](eslint.config.js:1) командой git checkout --.
- Типичные конфликты и решения:
  - Плагины import/import-x: не устанавливать оба одновременно в активном конфиге. Выберите один вариант (рекомендован import-x) и удалите другой.
  - Ошибка "Cannot find module '@eslint/js'": убедиться, что devDependencies установлены до линта; при Docker — NODE_ENV=development на шаге установки или npm ci без omit=dev.
  - Разрешение импорта .js в TS: держать eslint-import-resolver-typescript@^3 и настройки resolver в settings. При проблемах с путями добавить tsconfig paths.

Open items для уточнения
- Нужен ли сохранённый пакет eslint-config-next в корне, или полностью перейти на @next/eslint-plugin-next в flat-конфиге для фронтендов?
- Окончательно утвердить выбор между eslint-plugin-import-x (рекомендуется) и eslint-plugin-import. Если выберете import, потребуется тщательная настройка rules/import/extensions во избежание конфликтов с политикой .js.
- Нужны ли дополнительные overrides для специфики Next 16 в [frontend-enhanced](frontend-enhanced/package.json:1) (React 19, Next 16)?

Чек-лист выполнения
- [ ] Установить/обновить зависимости: eslint, @eslint/js, typescript-eslint, eslint-plugin-import-x, eslint-import-resolver-typescript, eslint-plugin-unused-imports, eslint-plugin-simple-import-sort, eslint-plugin-react, eslint-plugin-react-hooks, @next/eslint-plugin-next, globals.
- [ ] Применить черновик [eslint.config.mjs](eslint.config.mjs:1) в корне (заменить существующий содержимым из раздела выше).
- [ ] Обновить скрипты в [package.json](package.json:6) по разделу Scripts.
- [ ] Запустить локально: npm ci && npm run lint; убедиться в корректности резолва импортов и применимости правила .js.
- [ ] Настроить CI шаг R2 (install devDeps → lint → сохранить артефакт в [reports/artifacts/ci_logs/eslint_latest.log](reports/artifacts/ci_logs/eslint_latest.log:1)).
- [ ] После стабилизации удалить легаси [eslint.config.js](eslint.config.js:1), чтобы не было двусмысленности.

---

# Plan v2 — ESLint 9 flat-config consolidation (append-only, 2025-11-10)

Контекстные файлы: [eslint.config.mjs](eslint.config.mjs:1), [eslint.config.js](eslint.config.js:1), [package.json](package.json:1), [frontend/next.config.js](frontend/next.config.js:1), [frontend-enhanced/next.config.js](frontend-enhanced/next.config.js:1), [frontend-simple/next.config.js](frontend-simple/next.config.js:1), [reports/artifacts/ci_logs/lint.log](reports/artifacts/ci_logs/lint.log:1), [reports/artifacts/ci_logs/summary.md](reports/artifacts/ci_logs/summary.md:1)

1) Delta Plan v2 (Remove duplicate config)
- Диагностика
  - Одновременное наличие [eslint.config.mjs](eslint.config.mjs:1) (flat-config) и [eslint.config.js](eslint.config.js:1) (legacy-стиль с module.exports) создаёт двусмысленность в резолвинге конфигурации инструментами и IDE.
  - В ESLint 9 flat-config является единственным поддерживаемым форматом; однако многие экосистемные инструменты (IDE, старые runner-скрипты) всё ещё ищут legacy-файлы и могут:
    - Игнорировать [eslint.config.mjs](eslint.config.mjs:1), если встречают [eslint.config.js](eslint.config.js:1).
    - Загружать обе конфигурации в разных контекстах (CLI vs IDE), получая несовместимые наборы правил.
  - В этом репо "type": "module" ([package.json](package.json:4)), поэтому файл [eslint.config.js](eslint.config.js:1) должен быть ESM. Сейчас он использует CommonJS (module.exports), что само по себе конфликтует с ESM-режимом узла и может ломать загрузку.
- Варианты устранения дубликата (описываем оба, выбираем A)
  - A) Депрецировать [eslint.config.js](eslint.config.js:1) → удалить файл
    - Плюсы: однозначность flat-config, исключение legacy-пути резолва, упрощение CI/IDE.
    - Минусы: временно потребуется синхронизировать IDE-настройки у разработчиков, которые ссылались на .js.
  - B) Проксировать [eslint.config.js](eslint.config.js:1) на mjs
    - Содержимое (ESM one-liner): 
      ```js
      export { default } from "./eslint.config.mjs";
      ```
    - Плюсы: IDE, ожидающие eslint.config.js, начнут использовать единый flat-config.
    - Минусы: лишний слой; может маскировать проблемы, если где-то всё ещё подмешивается legacy-параметризация.
- Выбор: A (удаление) как целевой. В текущем цикле не изменяем файлы — фиксируем план и риски.

2) Minimal Flat-Config baseline
- База
  - Включить рекомендованные пресеты: @eslint/js recommended и typescript-eslint recommended — применяются глобально через [eslint.config.mjs](eslint.config.mjs:1).
- TS overrides (backend и общие)
  - Папки: server, shared, tests.
  - Типо-осведомлённый анализ включать точечно по этим путям (parserOptions.project указывает на корневой tsconfig и tsconfig фронтов — список проектов).
- Next overrides (фронты)
  - Папки: frontend, [frontend-enhanced](frontend-enhanced/next.config.js:1), [frontend-simple](frontend-simple/next.config.js:1).
  - Плагины: react, react-hooks, @next/eslint-plugin-next.
  - Минимальный набор правил без чрезмерной строгости: rules-of-hooks = error, exhaustive-deps = warn/off (см. п.3), часть next-правил в warn/off.
- Политика ESM Above All
  - Требование проекта: в .ts относительные импорты должны заканчиваться на .js (см. [00_core_principles.md](.kilocode/rules/00_core_principles.md:1)).
  - Отслеживание: на первом шаге через простое правило (pattern match: ImportDeclaration без .js/.mjs/.cjs в относительных путях) либо через отдельный pre-commit/CI чек (скрипт-сканер), чтобы не блокировать скорость миграции.
- Игноры (минимальный фиксированный набор)
  - node_modules/**
  - dist/**
  - .next/**, frontend/.next/**, frontend-enhanced/.next/**, frontend-simple/.next/**
  - coverage/**
  - reports/**
  - logs/**
  - drizzle/migrations/meta/**
  - out/**
  - tmp/**
  - uploads/**
  - *.tsbuildinfo
- Импорт/резолвер (import-x)
  - Плагин: eslint-plugin-import-x.
  - settings."import-x/resolver":
    - typescript: project = [./tsconfig.json, ./frontend/tsconfig.json, ./frontend-enhanced/tsconfig.json, ./frontend-simple/tsconfig.json], alwaysTryTypes = true.
    - node: extensions = [".js", ".mjs", ".ts", ".tsx"].

3) Proposed eslint.config.mjs (черновик структуры — не менять файл сейчас)
- Формат: ESM flat-config. Импорты: @eslint/js, typescript-eslint, eslint-plugin-import-x, eslint-plugin-unused-imports, eslint-plugin-simple-import-sort, eslint-plugin-react, eslint-plugin-react-hooks, @next/eslint-plugin-next, globals.
- Общий сегмент
  - files: **/*.{js,mjs,ts,tsx}; languageOptions: parser = tseslint.parser, ecmaVersion = latest, sourceType = module; globals: es2024.
  - plugins: import-x, unused-imports, simple-import-sort.
  - settings: import-x/resolver (см. п.2).
  - rules (минимум):
    - ESM Above All: запрет относительных импортов без расширения (.js|.mjs|.cjs).
    - import-x/no-unresolved: error (с перечислением extensions).
    - unused-imports/no-unused-imports: error.
    - simple-import-sort/*: off на первом проходе, чтобы избежать предупреждений; включить позже.
- TS overrides (server, shared, tests)
  - files: server/**, shared/**, tests/**.
  - parserOptions.project = множественный список tsconfig; tsconfigRootDir = repo root.
  - Дополнительные node-глобалы.
  - Начать без жёстких typescript-eslint строгих правил, подключать итеративно.
- Next overrides (frontend, frontend-enhanced, frontend-simple)
  - files: соответствующие подпроекты.
  - plugins: react, react-hooks, @next/eslint-plugin-next.
  - rules: 
    - react-hooks/rules-of-hooks: error.
    - react-hooks/exhaustive-deps: off (или warn после стабилизации).
    - Несколько next-правил: в warn/off, чтобы избежать шумных предупреждений.
- Игноры: полный список из п.2.
- Пошаговые изменения при миграции (во избежание конфликтов и лишней строгости)
  1) Добавить root ignores и базовые recommended пресеты.
  2) Подключить import-x resolver и ограниченный набор правил (no-unresolved, ESM Above All).
  3) Включить unused-imports/no-unused-imports: error.
  4) Добавить TS overrides только для server/shared/tests (type-checked).
  5) Добавить Next overrides с минимальным набором правил (hooks = error, остальное off/warn).
  6) Оставить simple-import-sort выключенным (off) на первом цикле; включить warn после прохождения линта, позже перевести в error.
  7) Исключить любые дублирующиеся/конкурирующие плагины (import vs import-x).

4) Rerun Lint — инструкции
- Локально
  - Команда запуска: npm run lint (скрипт уже ссылается на [eslint.config.mjs](eslint.config.mjs:1), см. [package.json](package.json:33)).
  - Лог (append-only) в [reports/artifacts/ci_logs/lint.log](reports/artifacts/ci_logs/lint.log:1):
    - bash/zsh: npm run lint 2>&1 | tee -a reports/artifacts/ci_logs/lint.log
    - PowerShell: npm run lint 2>&1 | Tee-Object -FilePath reports/artifacts/ci_logs/lint.log -Append
    - cmd.exe: npm run lint >> reports\artifacts\ci_logs\lint.log 2>&1
- CI
  - Установка: npm ci (без --omit=dev) — иначе @eslint/js и плагины не установятся.
  - Линт и артефакт:
    - bash: npm run lint 2>&1 | tee -a reports/artifacts/ci_logs/lint.log
  - Обновление резюме: дописать строку в [reports/artifacts/ci_logs/summary.md](reports/artifacts/ci_logs/summary.md:1) с временной меткой и статусом:
    - Пример строки: 2025-11-10T05:50:00Z LINT SUCCESS logs: reports/artifacts/ci_logs/lint.log
- Windows/Unix различия
  - Перенаправление вывода: используйте примеры выше (PowerShell Tee-Object, cmd.exe >> file 2>&1, bash tee).

5) Risks / Rollback
- Удаление [eslint.config.js](eslint.config.js:1)
  - Риск: локальные IDE-профили могли ссылаться на .js — потребуется перезапуск/Reload Window.
  - Откат: git checkout -- eslint.config.js.
- Потеря devDependencies в CI
  - Риск: npm ci с omit=dev → ESLint не найдёт @eslint/js (см. логи в [reports/artifacts/ci_logs/lint.log](reports/artifacts/ci_logs/lint.log:1)).
  - Решение: устанавливать devDeps до линта.
- Конфликты плагинов
  - import и import-x вместе → пересечения правил; оставить только eslint-plugin-import-x.
  - Несовместимость отдельных правил Next/React — временно в warn/off, повысить строгость после зелёного прогона.
- Резолв .js vs .ts при ESM
  - Держать eslint-import-resolver-typescript@^3 и корректный список tsconfig проектов; при алиасах — добавить paths в tsconfig и resolver.

6) Action Checklist (для ближайшего цикла)
- [ ] Подтвердить вариант устранения дубликата: A (удаление [eslint.config.js](eslint.config.js:1)) или B (прокси на [eslint.config.mjs](eslint.config.mjs:1)).
- [ ] Применить минимальный flat-config baseline в [eslint.config.mjs](eslint.config.mjs:1) по п.3 (без повышения строгости).
- [ ] Удалить/или переадресовать [eslint.config.js](eslint.config.js:1) согласно выбранному варианту.
- [ ] Перезапустить линт и дописать лог в [reports/artifacts/ci_logs/lint.log](reports/artifacts/ci_logs/lint.log:1); обновить [reports/artifacts/ci_logs/summary.md](reports/artifacts/ci_logs/summary.md:1) отметкой SUCCESS/FAILED.
- [ ] После зелёного прогона утвердить повышение строгости (включить simple-import-sort: warn → позже error; активировать дополнительные правила typescript-eslint для server/shared/tests).