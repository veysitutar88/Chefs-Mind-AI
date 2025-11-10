# 5-Этапный план: Обновления документации и окружения

**Дата создания**: 2025-11-10 00:34  
**Статус**: ГОТОВ К ПРИМЕНЕНИЮ

## Этап 1: Prepare (Подготовка)

### Цель
Создание резервных копий и проверка текущего состояния системы

### Действия
1. **Резервная копия конфигураций**
   ```bash
   cp .env.production.test .env.production.test.backup
   cp docker-compose.prod.yml docker-compose.prod.yml.backup
   ```

2. **Проверка текущего состояния портов**
   ```bash
   netstat -tuln | grep -E ':(3000|3001|5003|5432)'
   ```

3. **Создание тега Git**
   ```bash
   git tag -a "pre-port-config-$(date +%Y%m%d-%H%M)" -m "Состояние до обновления портов 5003"
   ```

### Критерии готовности
- Резервные копии созданы
- Git тег зафиксирован
- Текущие порты свободны

---

## Этап 2: Deploy (Развертывание)

### Цель
Применение обновлений документации и конфигурации портов

### Действия
1. **Обновление Docker Compose**
   ```yaml
   # Обновление портов в docker-compose.prod.yml
   backend:
     ports:
       - "5003:5003"  # API порт
   frontend-enhanced:
     ports:
       - "3000:3000"  # Основной frontend
   frontend-simple:
     ports:
       - "3001:3001"  # Упрощенный frontend
   ```

2. **Обновление package.json скриптов**
   ```json
   {
     "dev:server": "cross-env NODE_ENV=development PORT=5003 tsx watch server/index.ts"
   }
   ```

3. **Применение миграций Drizzle**
   ```bash
   npm run drizzle:migrate
   ```

### Критерии завершения
- Docker Compose обновлен
- Скрипты package.json актуализированы
- Миграции применены

---

## Этап 3: Rollback (Откат)

### Цель
План быстрого возврата к предыдущему состоянию в случае ошибок

### Действия при ошибке
1. **Восстановление конфигураций**
   ```bash
   cp .env.production.test.backup .env.production.test
   cp docker-compose.prod.yml.backup docker-compose.prod.yml
   git checkout $(git rev-list --tags --skip=1 --max-count=1 --format=format:%{id})
   ```

2. **Остановка сервисов**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

3. **Очистка ресурсов**
   ```bash
   docker system prune -f
   ```

### Триггеры для отката
- Health endpoint возвращает 5xx ошибки
- Frontend не может подключиться к backend
- Критические зависимости недоступны

---

## Этап 4: Log (Логирование)

### Цель
Документирование всех изменений для аудита и отслеживания

### Действия
1. **Запись в ACTION_LOG.md**
   ```markdown
   ## 2025-11-10 00:34 - Обновление портов 5003
   - Изменен API порт с 5001 на 5003
   - Обновлен docker-compose.prod.yml
   - Обновлены скрипты package.json
   - Статус: УСПЕШНО
   ```

2. **Создание отчета артефактов**
   ```bash
   mkdir -p reports/artifacts/2025-11-10/0034
   cp -r reports/artifacts/2025-11-10/0033/ reports/artifacts/2025-11-10/0034/
   ```

3. **Обновление документации**
   - docs/PORT_CONFIGURATION.md
   - docs/DEVELOPMENT_GUIDE.md

### Формат логирования
- Временная метка (UTC)
- Имя пользователя
- Описание изменений
- Статус (SUCCESS/WARNING/ERROR)
- Ссылки на артефакты

---

## Этап 5: Validate (Валидация)

### Цель
Проверка работоспособности всех компонентов после изменений

### Действия
1. **Smoke тесты**
   ```bash
   # Health check
   curl -f http://localhost:5003/health
   
   # Frontend connectivity
   curl -f http://localhost:3000/api/health
   curl -f http://localhost:3001/api/health
   ```

2. **Тестирование БД подключения**
   ```bash
   npm run test:db-connection
   ```

3. **Проверка CORS**
   ```bash
   npm run test:cors
   ```

### Критерии успеха
- Все endpoints отвечают 200 OK
- Frontend может обращаться к backend
- БД доступна и отвечает
- Логи не содержат критических ошибок

---

## Временные рамки

| Этап | Ожидаемое время | Ответственный |
|------|-----------------|---------------|
| Prepare | 5-10 мин | DevOps |
| Deploy | 10-15 мин | Backend |
| Rollback (при необходимости) | 2-5 мин | DevOps |
| Log | 3-5 мин | Technical Writer |
| Validate | 5-10 мин | QA |

**Общее время**: 25-45 минут (без учета Rollback)

---

## Контакты при проблемах

- **Критические ошибки**: DevOps Team
- **Backend проблемы**: Backend Team
- **Frontend проблемы**: Frontend Team
- **Документация**: Technical Writer

---

**План создан**: 2025-11-10 00:34:52.439Z  
**Автор**: Kilo Code Architect  
**Версия**: 1.0