# Инструкции для запуска после включения Docker Desktop

## Требования
- Запустить Docker Desktop
- Убедиться, что Docker доступен (`docker version` должен работать)

## Команды для выполнения

```bash
# 1. Остановить и очистить существующие контейнеры
docker compose -f docker-compose.prod.yml down -v --remove-orphans

# 2. Пересобрать и запустить сервисы
docker compose -f docker-compose.prod.yml up -d --build

# 3. Проверить статус сервисов
docker compose -f docker-compose.prod.yml ps > reports/prod_ps_after.log

# 4. Сохранить логи сервисов
docker compose -f docker-compose.prod.yml logs --no-color --tail=200 > reports/prod_logs_after.log

# 5. Проверить доступность endpoints
curl -sSI http://localhost:5001/ > reports/prod_root_head_final.log 2>&1
curl -sS http://localhost:5001/health -v > reports/prod_health_curl_final.log 2>&1
```

## Ожидаемый результат

### Backend (порт 5001)
- **GET /** - должен возвращать 200 OK с HTML страницей
- **GET /health** - должен возвращать 200 OK (если endpoint зарегистрирован)

### Frontend (порт 3000)  
- Должен быть доступен и работать корректно

## Текущее состояние проекта

### Исправления уже внесены:
1. ✅ Создан `public/index.html` в корне репозитория
2. ✅ Обновлен Dockerfile для копирования папки `public`
3. ✅ Исправлены TypeScript импорты в `server/utils/static.ts`
4. ✅ Настроен `.env` файл с DATABASE_URL

### Ожидаемое поведение после запуска Docker:
- Backend должен обслуживать статические файлы из `/app/public`
- Корневой путь `/` должен возвращать 200 OK
- Frontend должен быть доступен на порту 3000