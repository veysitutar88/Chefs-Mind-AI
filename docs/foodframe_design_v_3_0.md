# FOODFRAME DESIGN v3.0
Chef’s Mind AI — Media Studio Module

## 1. Overview
FoodFrame — модуль медиапроизводства Chef’s Mind AI, отвечающий за генерацию изображений блюд, редактирование фотографий и видеогенерацию food-promo контента, соблюдая эстетику June Six.

## 2. Core Model Engines (v3.0)
### 2.1 Image Engines (Primary)
- **Gemini 3 Image Pro** — основной генератор и редактор (add/remove objects, style change, realism).

### 2.2 Image Engines (Secondary)
- **Imagen 4** — фотореализм, сложные сцены.
- **GPT-image-1** — быстрые мокапы и вариации.

### 2.3 Video Engines
- **Veo 3 / Veo 3.1** — видео food-promo, slow-motion, plating.

## 3. Routing Logic
```
if food photo → gemini-3-image-pro
if edit → gemini-3-image-pro
if advertising realism → imagen-4
if mockup/variation → gpt-image-1
if video → veo-3.1 (fallback veo-3)
```

## 4. FoodFrame Capabilities
### 4.1 Image Generation
- формат 4:5, мягкий боковой свет, низкий ключ.
- реалистичные текстуры, microgreens, affila, shiso.

### 4.2 Editing (Gemini 3 Image Pro)
- удаление/вставка объектов.
- реконструкция фона.
- коррекция света/теней.

### 4.3 Video
- slow-motion,
- pouring,
- cinematic bokeh.

## 5. Prompt Pipeline
```
Input → Pre-processor → Validator → Routing → Generator → Post-process → Output
```

## 6. API Endpoints
### Image
```
POST /api/foodframe/image
{
 "model": "gemini-3-image-pro",
 "prompt": "...",
 "format": "4:5",
 "style_profile": "june_six_finedining",
 "enhance": true
}
```
### Video
```
POST /api/foodframe/video
{
 "model": "veo-3.1",
 "prompt": "...",
 "duration": "3-12s",
 "style": "slow_motion_finedining"
}
```

## 7. Model Registry
```
image_engines = [
 "gemini-3-image-pro",
 "imagen-4",
 "gpt-image-1"
]

video_engines = [
 "veo-3",
 "veo-3.1"
]
```

## 8. Compliance With June Six Aesthetic
- fine dining minimalism
- low‑key
- soft warm light
- формат 4:5

## 9. Versioning
- FoodFrame Design v3.0 — финальная версия
- Совместим с Chef’s Mind AI v2.2

