Status: supporting / historical document. Canonical routing is defined in AGENT_ROUTING_DESIGN.md and MASTER_CONTEXT_v2.1.6.

<!-- docs/UI_SPEC_v1.1.md -->

# Chef’s Mind AI — UI SPEC v1.1
_Final approved interface architecture for v2.1.6_

---

## 0. Core Principles

- Dark, premium, fine-dining aesthetic (June Six style).
- Universal Chat = главный вход, **не агент**.
- Layout: three columns  
  - Left Sidebar — навигация и агентские рабочие зоны  
  - Center — чаты и рабочие пространства  
  - Right Sidebar — инструменты и контекст.
- Каждый агент имеет крупный заголовок в центре.
- QA-агент не отображается в UI.

---

## 1. Login Screen

- Полноэкранный layout без сайдбаров.
- Фон: затемнённый hero (кухня, мягкий свет, Na’Vi blue акцент).
- Центр:
  - Лого: **Chef’s Mind AI**
  - Subtitle: _AI assistant for kitchen, accounting and media_
  - Кнопка: **Sign in with Google** → `/auth/google`
  - Footer: _Access restricted to the owner and June Six team._
- Logout доступен из профиля после входа.

---

## 2. Main Application Shell (после login)

- **Header**  
  - Слева: мини-логотип Chef’s Mind AI (клик → Universal Chat).  
  - Справа: аватар пользователя (меню профиля / Logout).

- **Left Sidebar** (см. раздел 4).

- **Center Area**  
  - Universal Chat или workspace выбранного агента.  

- **Right Sidebar**  
  - Сворачивается/раскрывается.  
  - Показывает поиск, медиа, календарь и статус агентов.

---

## 3. Universal Chat (Home)

- Открывается:
  - при первом входе;
  - по клику на логотип в левом верхнем углу;
  - по кнопке **+ New Chat**.

- Заголовок в центре: **Chef’s Mind AI** (без имени агента).

- Функции:
  - GPT-подобный чат с оркестратором.
  - Авто-роутинг запросов к AI Sous-Chef, AI Brain-Chef, AI Research, AI Media-Studio.
  - Поле ввода, кнопка отправки, прикрепление файлов.
  - (Опционально) селектор модели/агента для ручного выбора.

---

## 4. Left Sidebar — Final Structure

Порядок элементов сверху вниз:

1. **Chef’s Mind AI (logo/home)**  
   - Клик → Universal Chat.

2. **+ New Chat**  
   - Создаёт новый универсальный чат с оркестратором.

3. **AI Sous-Chef**  
   - Рабочая зона шефа: рецепты, меню, кухня.

4. **AI Brain-Chef**  
   - Финансы, закупки, отчёты, food cost.

5. **AI Research**  
   - Исследования, документы, внешняя аналитика.

6. **AI Media-Studio**  
   - Медиа-генерация: изображения и видео.

7. **⚙ Settings**  
   - Всегда в самом низу сайдбара.

Правила:

- Universal Chat **не** представлен отдельным пунктом списка — только логотип и `+ New Chat`.
- QA-агент **никогда** не показывается.

---

## 5. Agent Workspaces

Каждый агент имеет собственную страницу вида `/agents/{slug}`.

### Общий layout агента

- **Внутренний левый столбец** (в центре):
  - Список чатов этого агента:
    - заголовок / краткое описание;
    - время последнего сообщения.
  - Кнопка **+ New Chat** (создаёт чат именно с этим агентом).

- **Правая часть (основная панель)**:
  - Крупный заголовок:
    - `AI Sous-Chef`, `AI Brain-Chef`, `AI Research`, `AI Media-Studio`.
  - Badge/иконка агента.
  - История сообщений.
  - Поле ввода + прикрепление файлов.
  - (Опционально) настройки чата.

---

### 5.1 AI Sous-Chef Workspace

- Фокус: рецепты, меню, кухня, остатки.
- Может отображать:
  - текущие меню;
  - списки блюд;
  - контекст по складам.
- Взаимодействует с Media-Studio:
  - кнопка/команда вида **“Generate Dish Image”**, запускающая генерацию визуала для блюда.

---

### 5.2 AI Brain-Chef Workspace

- Фокус: финансирование, отчёты, food cost.
- UI элементы:
  - блоки для финансовых расчётов (результаты в виде таблиц/сводок);
  - подсветка цен, маржи, прибыли.
- Используется для:
  - расчёта себестоимости;
  - подготовки отчётов;
  - анализа прибыльности меню.

---

### 5.3 AI Research Workspace

- Фокус: аналитика, поиск, документы.
- Может показывать:
  - найденные источники;
  - выдержки из документов;
  - сравнительные таблицы.

---

### 5.4 AI Media-Studio Workspace

- Специализированный интерфейс для медиа:
  - Вкладка/секции:
    - **Generator** — форма генерации медиа;
    - **Jobs** — список задач / прогресс;
    - **Gallery** — библиотека ассетов.
  - Поля:
    - prompt;
    - селектор типа (`Image` / `Video`);
    - выбор модели (`DALL·E`, `Imagen`, `Veo`);
    - параметры (разрешение, длительность);
    - загрузка reference-изображений/видео.

- Чат в Media-Studio:
  - Используется как журнал задач и пояснений к генерациям.

---

## 6. Right Sidebar — Tools

Правый сайдбар доступен на всех страницах.

### 6.1 Search

- Поиск по:
  - историям чатов;
  - (опционально) медиа-ассетам;
  - (в будущем) заметкам и заказам.

### 6.2 Media Library

- Лента превью изображений и видео.
- Метаданные:
  - дата/время;
  - модель/провайдер;
  - источник (агент, чат).
- Клик по элементу:
  - полноэкранный просмотр с prompt’ом и параметрами.

### 6.3 DB Outline

- Лёгкий обзор ключевых сущностей:
  - Orders;
  - Suppliers;
  - Calendar Events;
  - Notes.
- Без CRUD в v1 — только отображение.

### 6.4 Agent Status

- Активный агент текущего чата.
- Последние действия роутинга:
  - например: `Sous-Chef → Brain-Chef (costing)`  
- Статус: idle / thinking / error.

### 6.5 Calendar Overlay

- Кнопка 📅 в правом сайдбаре → открывает глобальный календарь.
- Календарь:
  - месячный вид;
  - кнопки `←`, `→`, `Today`;
  - подсветка дней с событиями;
  - клик по дню → список событий (внутри оверлея справа).

---

## 7. Settings Page

Доступ: клик по **⚙ Settings** в левом сайдбаре.

Разделы:

1. **Profile**
   - Google email;
   - кнопка Logout.

2. **Models & Providers**
   - список активных провайдеров (OpenAI, Google, Perplexity и т.д.);
   - выбор дефолтной модели/агента для Universal Chat.

3. **Appearance**
   - Dark theme по умолчанию;
   - выбор accent-цвета (Na’Vi blue — базовый).

4. **Safety**
   - SAFE_MODE on/off;
   - подтверждение для опасных операций (backup, импорт, destructive-операции с БД).

---

## 8. Distinction Rules

Чтобы пользователь **никогда не путал** Universal Chat и агентские чаты:

- В Universal Chat заголовок — **Chef’s Mind AI**.
- В агентских workspaces — крупные заголовки:
  - **AI Sous-Chef**
  - **AI Brain-Chef**
  - **AI Research**
  - **AI Media-Studio**
- Цветовые бейджи/иконки могут отличаться для агентов.

---

## 9. Future Extensions

- Табы в правом сайдбаре (уменьшение визуального шума).
- Редактируемый DB Viewer.
- Расширенные режимы Media-Studio.
- Интеграция поставщиков и инвентаря.
- Шаблоны рабочих пространств (пресеты чатов).

---

_Этот документ является основой для реализации фронтенда Chef’s Mind AI v2.1.6._
# Markdown Document

## Introduction

Markdown is a plain text formatting syntax.

Paragraphs are separated by empty lines.

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Character Styles

These spans result in 'em' tags:

- *single asterisks*
- _single underscores_

These spans result in 'strong' tags:

- **double asterisks**
- __double underscores__

These spans result in 'del' tags:

- ~~double tildes~~

## Links and Images

This is an [example inline link](https://www.actiprosoftware.com "Actipro Software") with tooltip text specified.
[This link](https://www.actiprosoftware.com) has no tooltip text specified.

URLs and e-mail addresses can be turned into links by enclosing them in angle braces:

- <https://www.actiprosoftware.com>  
- <support@microsoft.com>

[This link](#markdown-document) links to the first heading in this document via custom ID.

## Images

This is an example of an image:

![Image](https://www.microsoft.com/favicon.ico)

This is an example of an image with a link:

[![Image](https://www.google.com/favicon.ico)](https://www.google.com)

## Blockquotes

Markdown said:

> This is the first level of quoting.
>
> > This is a nested blockquote.
>
> Back to the first level.

## Lists

Unordered list using minus signs (-):

- Step 1
- Step 2
- Step 3
  - Step 3a
  - Step 3b
  - Step 3c

Unordered list using plus signs (+):

+ Step 1
+ Step 2
+ Step 3
  + Step 3a
  + Step 3b
  + Step 3c

Unordered list using asterisks (*):

* Step 1
* Step 2
* Step 3
  * Step 3a
  * Step 3b
  * Step 3c

Ordered list:

1. Step 1
1. Step 2
1. Step 3
    1. Step 3a
    1. Step 3b
    1. Step 3c

Nested (unordered within ordered) list:

1. Step 1
1. Step 2
1. Step 3
    - Step 3a
    - Step 3b
    - Step 3c

Definition list:

Term #1
: This is the definition of term #1.

Term #2
: This is the definition of term #2.

## Code Blocks

Inline `code` can be delimited with characters.

This code block is fenced with three backticks and has its language specified:

```javascript
var oldUnload = window.onbeforeunload;
window.onbeforeunload = function() {
    saveCoverage();
    if (oldUnload) {
        return oldUnload.apply(this, arguments);
    }
};
```

This code block is fenced with three tildes and has its language specified:

~~~ruby
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
~~~

This code block is created by indenting the code, but no language can be specified:

    var foo = 1;

## Tables

| Fruit  | Color  |
|--------|--------|
| Apples | Red    |
| Grapes | Purple |
| Lemons | Yellow |

## Horizontal Rules

Horizontal rules are formed by placing three or more hyphens, asterisks, or underscores on a line by themselves.

---

***

___

## HTML Tags

<strong>HTML tags</strong> can optionally be used in <em>Markdown</em>.

## Special Characters

Unescaped:
\ ` * _ { } [ ] ( ) # + - . !

Backslash-Escaped:
\\ \` \* \_ \{ \} \[ \] \( \) \# \+ \- \. \!
