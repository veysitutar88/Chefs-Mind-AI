# Chef's Mind AI — Release v2.1.1 (smoke-pass)

Дата: 2025-10-17  
Состояние: Stable (local) · Smoke 6/6 · API 5001 · UI 3000

## Ключевые изменения
- **Bind/Port:** сервер слушает `0.0.0.0`, внутр. порт `5000`, наружу `5001`.
- **Health/Metrics:** 200 OK с хоста, Prometheus доступен.
- **Smoke Suite:** 6/6 passed (health, metrics, oauth, rbac, import, calendar).
- **DB:** создана таблица `ingredients` (UPSERT-совместима), миграция подготовлена.
- **Docker:** удалены `version` в compose, убраны лишние порты, healthcheck.
- **Frontend:** Next 14 очищен (убран `experimental.appDir`), удалён несуществующий пакет `@radix-ui/react-button`, добавлен `postcss.config.js`.
- **API wiring:** фронт подключён к `http://localhost:5001`, dev на `http://localhost:3000`, кнопка `Ping API` работает.

## Endpoints
- API base: `http://localhost:5001`
- Health: `http://localhost:5001/api/health`
- Metrics: `http://localhost:5001/metrics`
- UI (dev): `http://localhost:3000`

## Миграции БД
- `01_create_ingredients.sql` — таблица `ingredients` + уникальный индекс `(lower(name), lower(unit))`.

## Smoke summary
- health ✅, metrics ✅, oauth ✅, rbac ✅, import ✅, calendar ✅
- Итог: **6/6 passed**

## Что важно знать
- Наружный порт API стандартизирован на `5001` (обход конфликтов wslrelay на 5000).
- В dev сценарии UI и API разнесены (3000/5001). В prod выбрать стратегию:
  - A) отдельный UI (3000);
  - B) сборка статики в `server/public` и раздача через сервер (5001).

## Рекомендации на следующий спринт
1. **CI Smoke Gate:** добавить джобу, которая поднимает compose и запускает `scripts/smoke_suite.ps1 -HostUrl http://localhost:5001`.
2. **Surface Deploy:** инструкция и автозапуск (schtasks).
3. **UI Build-badge:** выводить `Build: <ISO timestamp>` в футере для борьбы с кэшем.
4. **Media presets:** зафиксировать пресеты по освещению/посуде (Genie6/June) и связать с агентом MediaStudio.
5. **UTF-8 guard:** автоматическая проверка кодировки файлов.

## Чекпоинт
- Смотри `checkpoints/master_checkpoint_2025_10_17.json` (полный снимок состояния).
