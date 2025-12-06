# ACRP — Auto-Context Restore Protocol (Chef’s Mind AI)

**Версия:** 1.0  
**Статус:** Active  
**Дата:** 2025-12-05

## 1. Цель

Обеспечить единый, детерминированный механизм «холодного старта» для любого AI-агента, подключающегося к проекту. Исключить необходимость ручного копирования контекста пользователем.

## 2. Триггеры запуска

Протокол должен быть выполнен (частично или полностью) в следующих ситуациях:

- **New Session:** Начало новой сессии разработки.
- **Agent Switch:** Переключение между ролями (например, Architect → Implementer).
- **Major Pull:** После получения крупных обновлений из репозитория.

## 3. Канонический набор контекста

Агент обязан прочитать следующие ресурсы (если они существуют):

### A. Стратегия и Мастер-контекст

- `docs/Chef’s Mind AI — MASTER_STRATEGY v2.2 (Project Plan).pdf`
- `docs/Chef’s Mind AI — Unified Master Context (D-FILE v2.1.6 → v2.2 Integration).txt`
- `docs/Unified Master Context (JSON Edition)FullD-File.json`

### B. Карта проекта и Код

- `docs/CHEF’S MIND AI — PROJECT SOURCE MAP (v2.2).txt`
- `docs/PROJECT_SOURCE_MAP_v1.0.txt` (резерв)
- `.context/knowledge_map.json`

### C. Когнитивный слой (Cognition Layer)

- `cognition_layer_guide.md`
- `.context/heatmap.json`
- `.context/decisions/*` (Принятые архитектурные решения)
- `.context/evolution/*` (Логи эволюции кодовой базы)

### D. Состояние сессии

- `CHECKPOINT.json` (Текущий активный блок и статус проекта)
- `SESSION.md` (Лог текущих действий)

## 4. Порядок загрузки (Load Order)

1. **Master Strategy & Context**: Понимание целей, ограничений и «духа» проекта.
2. **Project Map**: Понимание структуры файлов и директорий.
3. **Cognition Layer**: Загрузка памяти проекта, правил Git и архитектурных решений.
4. **Active State**: Определение текущей задачи (`active_block`, `active_step`) из `CHECKPOINT.json`.

## 5. Правила безопасности и ограничений
>
> [!IMPORTANT]
> **QA Middleware Only:** QA существует **только** как middleware (`qaGate` в коде). Использование "QA Agent" для генерации кода или тестов запрещено.
>
> **Legacy Archives:** Файлы в `docs/archive/*` считаются **LEGACY** (устаревшими). Их содержимое не должно переопределять активный контекст из `docs/` и `.context/`.
