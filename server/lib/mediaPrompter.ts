import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key-for-smoke-testing',
  dangerouslyAllowBrowser: true,
});
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'test-key');

interface MediaPrompterInput {
  goal: 'image' | 'video' | 'video-from-image';
  promptDraft: string;
  refs?: string;
  style?: string;
  aspect?: string;
  durationSec?: number;
}

interface ModelHints {
  provider: string;
  model: string;
  safety: string;
  aspect?: string;
  durationSec?: number;
}

interface MediaPrompterResult {
  prompt: string;
  negativePrompt?: string;
  modelHints: ModelHints;
}

function detectLanguage(text: string): 'ru' | 'en' {
  const cyrillicPattern = /[а-яёА-ЯЁ]/;
  return cyrillicPattern.test(text) ? 'ru' : 'en';
}

function normalizeStyle(style?: string): string {
  const normalized = style?.toLowerCase() || 'photoreal';
  const validStyles = ['photoreal', 'illustration', 'logo', 'food-styled'];
  return validStyles.includes(normalized) ? normalized : 'photoreal';
}

export async function generateMediaPrompt(
  input: MediaPrompterInput
): Promise<MediaPrompterResult> {
  const lang = detectLanguage(input.promptDraft);
  const style = normalizeStyle(input.style);

  // Build system prompt based on language
  const systemPrompt =
    lang === 'ru'
      ? `Ты эксперт по генерации промптов для AI-моделей создания изображений и видео.

Твоя задача: улучшить черновик промпта, сделать его четким, детальным и безопасным.

Правила:
1. Сохраняй язык входного промpта (русский)
2. Нормализуй стиль: ${style}
3. Добавь детали композиции, освещения, качества
4. Для видео: добавь подсказки по движению камеры и динамике
5. Создай negative prompt для исключения нежелательных элементов (NSFW, искажения, текст)
6. Ответ должен быть кратким и точным

Ответь в формате JSON:
{
  "prompt": "улучшенный промпт",
  "negativePrompt": "что исключить"
}`
      : `You are an expert in generating prompts for AI image and video generation models.

Your task: improve the draft prompt, make it clear, detailed and safe.

Rules:
1. Keep the language of the input prompt (English)
2. Normalize style: ${style}
3. Add composition, lighting, quality details
4. For video: add camera movement and dynamics hints
5. Create negative prompt to exclude unwanted elements (NSFW, distortions, text)
6. Keep response brief and precise

Reply in JSON format:
{
  "prompt": "improved prompt",
  "negativePrompt": "what to exclude"
}`;

  // Add goal-specific instructions
  let userPrompt = `Черновик промпта: ${input.promptDraft}`;

  if (input.goal === 'video-from-image') {
    userPrompt +=
      lang === 'ru'
        ? '\n\nЭто видео из изображения. Добавь подсказки по движению камеры (zoom, pan, tilt) и сохрани композицию исходного изображения.'
        : '\n\nThis is video from image. Add camera movement hints (zoom, pan, tilt) and preserve original image composition.';
  }

  if (input.refs) {
    userPrompt +=
      lang === 'ru'
        ? `\n\nСсылки на референсы: ${input.refs}`
        : `\n\nReference links: ${input.refs}`;
  }

  // Use Gemini for fast response (cheaper and faster than GPT-4)
  try {
    const geminiModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 1200,
        temperature: 0.7,
      },
    });

    const result = await geminiModel.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Determine provider and model based on goal
    let provider = 'imagen-3';
    let modelName = 'imagen-3';

    if (input.goal === 'video' || input.goal === 'video-from-image') {
      provider = 'veo-3';
      modelName = 'veo-3';
    }

    return {
      prompt: parsed.prompt || input.promptDraft,
      negativePrompt: parsed.negativePrompt,
      modelHints: {
        provider,
        model: modelName,
        safety: 'block_medium_and_above',
        aspect: input.aspect || (input.goal === 'video' ? '16:9' : '1:1'),
        durationSec:
          input.durationSec || (input.goal === 'video' ? 5 : undefined),
      },
    };
  } catch (error) {
    console.error('Media prompter error:', error);

    // Fallback: return original with basic model hints
    return {
      prompt: input.promptDraft,
      modelHints: {
        provider: input.goal === 'video' ? 'veo-3' : 'imagen-3',
        model: input.goal === 'video' ? 'veo-3' : 'imagen-3',
        safety: 'block_medium_and_above',
        aspect: input.aspect || '1:1',
        durationSec: input.durationSec,
      },
    };
  }
}
