# Block 4: Media Studio - Design Document

## 1. Обзор (Overview)

Media Studio — это интегрированный модуль в составе Chef's Mind AI, предназначенный для генерации медиа-контента (изображений и видео) с использованием передовых AI-моделей. Он предоставляет пользователям инструменты для создания визуальных материалов на основе текстовых описаний (промптов), автоматизируя и упрощая творческий процесс.

Основная цель — обеспечить гибкую и расширяемую архитектуру, которая позволит легко подключать различных AI-провайдеров (DALL·E, Imagen, Veo и др.) и управлять сгенерированными ассетами.

## 2. Провайдеры (Providers)

### 2.1. Архитектура "Провайдер-плагин"

Система будет построена на основе архитектуры "провайдер-плагин". Это позволит инкапсулировать логику взаимодействия с API каждого конкретного сервиса в отдельном модуле (плагине). Такой подход обеспечивает:
- **Расширяемость:** Новые провайдеры могут быть добавлены без изменения основного кода.
- **Изолированность:** Ошибки или изменения в API одного провайдера не влияют на работу других.
- **Простоту поддержки:** Код для каждого сервиса находится в своем собственном, легко управляемом файле.

### 2.2. Базовый интерфейс `MediaProvider`

Каждый плагин-провайдер должен реализовывать единый TypeScript интерфейс `MediaProvider`. Это гарантирует консистентность и предсказуемость их работы.

```typescript
// server/services/media/providers/types.ts

export interface MediaGenerationRequest {
  prompt: string;
  userId: string;
  options?: Record<string, any>; // Продвинутые опции: разрешение, стиль и т.д.
}

export interface MediaGenerationResponse {
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  provider: string;
  estimatedCompletionTime?: number; // в секундах
}

export interface JobStatusResponse {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number; // от 0 до 100
  assetUrl?: string;
  error?: string;
}

export interface MediaProvider {
  /**
   * Имя провайдера (e.g., "dalle", "veo").
   */
  readonly name: string;

  /**
   * Инициирует задачу генерации медиа.
   * @param request - Данные для запроса генерации.
   * @returns Promise с информацией о запущенной задаче.
   */
  generate(request: MediaGenerationRequest): Promise<MediaGenerationResponse>;

  /**
   * Проверяет статус задачи генерации.
   * @param jobId - Идентификатор задачи.
   * @returns Promise со статусом задачи.
   */
  getJobStatus(jobId: string): Promise<JobStatusResponse>;
}
```

## 3. Дизайн API (API Design)

API будет построено по принципу REST и будет обрабатывать асинхронные задачи генерации.

---

### `POST /api/media/generate/image`
Инициирует задачу генерации изображения.

**Request Body:**
```json
{
  "provider": "dalle" | "imagen",
  "prompt": "A photorealistic image of a futuristic kitchen",
  "options": {
    "resolution": "1024x1024",
    "quality": "hd"
  }
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "img-a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "status": "pending",
  "provider": "dalle"
}
```

---

### `POST /api/media/generate/video`
Инициирует задачу генерации видео.

**Request Body:**
```json
{
  "provider": "veo",
  "prompt": "A high-speed video of a chef preparing a complex dish",
  "options": {
    "duration": 15,
    "style": "cinematic"
  }
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "vid-b2c3d4e5-f6a7-8901-2345-67890abcdef1",
  "status": "pending",
  "provider": "veo"
}
```

---

### `GET /api/media/jobs/:jobId`
Возвращает статус конкретной задачи генерации.

**Response (200 OK):**
```json
{
  "jobId": "img-a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "status": "completed", // or "in_progress", "failed"
  "progress": 100,
  "assetUrl": "/assets/generated/a1b2c3d4.png", // URL для доступа к готовому файлу
  "error": null // или сообщение об ошибке
}
```

---

### `GET /api/media/assets`
Возвращает список сгенерированных медиа-ассетов для текущего пользователя.

**Query Parameters:**
- `limit` (number, optional, default: 20)
- `offset` (number, optional, default: 0)
- `provider` (string, optional)

**Response (200 OK):**
```json
{
  "total": 42,
  "assets": [
    {
      "id": "asset-a1b2-c3d4-e5f6",
      "userId": "user-123",
      "provider": "dalle",
      "prompt": "A photorealistic image...",
      "status": "completed",
      "assetUrl": "/assets/generated/a1b2c3d4.png",
      "createdAt": "2025-11-12T10:30:00Z"
    }
  ]
}
```

---

## 4. Хранение данных (Data Storage)

### 4.1. Схема таблицы `media_assets`

Для хранения метаданных о сгенерированных ассетах будет создана новая таблица в PostgreSQL.

**SQL Schema:**
```sql
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    job_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
    asset_url VARCHAR(512),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);
```

### 4.2. Хранение файлов

На начальном этапе (MVP) сгенерированные файлы будут храниться локально на сервере в директории `public/assets/generated`. Это упростит разработку и развертывание.

В дальнейшем, для обеспечения масштабируемости и надежности, будет реализована интеграция с S3-совместимым облачным хранилищем (например, AWS S3, MinIO). Конфигурация хранилища будет вынесена в переменные окружения, что позволит легко переключаться между локальным и облачным хранением.

## 5. Аутентификация и Авторизация (Authentication & Authorization)

Все эндпоинты Media Studio (`/api/media/*`) будут защищены с использованием существующей в проекте системы.
- **Аутентификация:** Каждый запрос должен содержать валидный JWT-токен.
- **Авторизация:** Будет использоваться middleware для RBAC (Role-Based Access Control). Доступ к генерации и просмотру ассетов будет ограничен на основе ролей пользователя (например, `admin`, `media_creator`). Каждый пользователь сможет видеть только свои сгенерированные ассеты.

## 6. Обработка ошибок (Error Handling)

Система обработки ошибок будет включать:
- **Ошибки API провайдеров:** Ошибки, возвращаемые внешними сервисами (недостаточно кредитов, невалидный промпт, сбой сервиса), будут перехвачены, залогированы и сохранены в поле `error_message` таблицы `media_assets`. Статус задачи будет изменен на `failed`.
- **Внутренние ошибки:** Ошибки валидации, проблемы с базой данных или хранилищем файлов будут обрабатываться централизованным `errorHandler` middleware.
- **Пользовательские ответы:** Клиенту будут возвращаться стандартизированные и понятные сообщения об ошибках с соответствующими HTTP-статусами (400, 401, 403, 500).
