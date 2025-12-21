# API Docs Summary

## Обзор

Данный документ содержит краткое резюме по документации API Chef's Mind AI. Полная спецификация доступна через Swagger UI.

-   **Swagger UI**: [http://localhost:5001/docs/api](http://localhost:5001/docs/api)
-   **OpenAPI JSON**: [http://localhost:5001/docs/openapi.json](http://localhost:5001/docs/openapi.json)

## Включённые эндпоинты

-   `POST /api/db/backup`: Резервное копирование базы данных.
-   `GET /api/sessions/resume`: Возобновление пользовательской сессии.
-   `POST /api/auth/google`: Аутентификация через Google.
-   `POST /api/transcribe`: Транскрибация аудио.
-   `GET /api/metrics`: Получение метрик Prometheus.

## Сводка по безопасности (Security Schemes)

-   **bearerAuth (JWT)**: Аутентификация с использованием JWT токена в заголовке `Authorization: Bearer <token>`.
-   **rbacAdmin**: Требование роли `admin` для выполнения определённых операций (например, write-операций).
-   **safeMode**: Требование заголовка `X-Confirm-Code` для write-операций. Значение кода подтверждения берётся из переменной окружения `CONFIRM_CODE`.
-   **cookieAuth**: Используется для управления сессиями (например, для `/api/sessions/resume`).

## Статус

**DOCS1 — спецификация и UI интегрированы.**

## Исходники настроек

-   Основная конфигурация сервера и интеграция Swagger UI: [server/index.ts](server/index.ts)
-   Спецификация OpenAPI: [docs/openapi.json](docs/openapi.json)