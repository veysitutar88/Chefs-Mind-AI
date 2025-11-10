# Addendum DEV_PORTS - Копия из .env.example

**Дата копирования**: 2025-11-10T01:22:06.118Z
**Исходный файл**: .env.example
**Строки**: 46-52

```bash
# === DEV BASELINE 5003 ===
# Утверждённая DEV политика портов (2025-11-10):
# - API Backend: 5003 (основной), 5001 (legacy) 
# - Frontend Primary: 3000, Frontend Backup: 3001
# - Старт: БД → API → Frontend
# Конфигурация: PORT=5003 (сервер), NEXT_PUBLIC_API_URL=http://localhost:5003 (фронтенд)
# Документация: README.md, RUNBOOK.md
```

**Примечание**: Этот блок был добавлен в конец файла .env.example в рамках 5-этапного плана по обновлению конфигурации портов.