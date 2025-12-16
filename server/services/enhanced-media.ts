import OpenAI from 'openai';
import { VertexAI } from '@google-cloud/vertexai';
import {
  MediaGenerationParams,
  MediaGenerationResult,
  EnhancedPromptResult,
} from '../../shared/types.js';

// Interface for OpenAI chat response
interface OpenAIChatResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Interface for Vertex AI response
interface VertexAIResponse {
  response: {
    candidates: Array<{
      content: {
        parts: Array<{
          inlineData?: {
            data: string;
            mimeType?: string;
          };
        }>;
      };
    }>;
  };
}

// Улучшенный Media Tool с множественными генераторами
export class EnhancedMediaTool {
  private openai: OpenAI;
  private vertexAI: VertexAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.vertexAI = new VertexAI({
      project: process.env.VERTEX_PROJECT_ID || 'your-project',
      location: process.env.VERTEX_LOCATION || 'us-central1',
    });
  }

  // MCP Prompt Enhancer на базе GPT-5
  async enhancePrompt(
    originalPrompt: string,
    mediaType: 'image' | 'video'
  ): Promise<EnhancedPromptResult> {
    try {
      const promptEnhancer = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const systemPrompt = `Ты - эксперт по созданию промптов для генерации ${mediaType === 'image' ? 'изображений' : 'видео'}. 
Твоя задача - улучшить исходный промпт, сделав его более детальным и эффективным.

Верни JSON с полями:
- enhancedPrompt: улучшенный промпт
- negativePrompt: негативный промпт (что НЕ должно быть на изображении/видео)
- suggestions: массив с 3-5 дополнительных идеий
- optimalGenerator: какой генератор лучше всего подойдет (dall-e-3, gpt-image, imagen-3, veo-3)`;

      const response = await promptEnhancer.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Временно GPT-4
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Улучши этот промпт для генерации ${mediaType}: ${originalPrompt}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      if (
        response.choices &&
        response.choices[0] &&
        response.choices[0].message
      ) {
        return JSON.parse(
          response.choices[0].message.content || '{}'
        ) as EnhancedPromptResult;
      }
      throw new Error('No data in response');
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return {
        enhancedPrompt: originalPrompt,
        suggestions: [],
        optimalGenerator: mediaType === 'image' ? 'dall-e-3' : 'veo-3',
      };
    }
  }

  // DALL-E 3 генератор
  async generateWithDALLE3(
    prompt: string,
    negativePrompt?: string,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    steps?: number,
    aspectRatio?: string
  ): Promise<MediaGenerationResult> {
    try {
      // Map aspect ratio to DALL-E supported formats
      let size = '1024x1024'; // default
      if (aspectRatio === '16:9') size = '1792x1024';
      else if (aspectRatio === '9:16') size = '1024x1792';
      else if (aspectRatio === '1:1') size = '1024x1024'; // square
      else if (aspectRatio === '4:5') size = '1024x1280';
      else if (aspectRatio === '3:2') size = '1536x1024';

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: `${prompt}${negativePrompt ? `\nNegative prompt: ${negativePrompt}` : ''}`,
        n: 1,
        size: size as any,
        quality: quality === 'hd' || quality === 'premium' ? 'hd' : 'standard',
        style: 'natural' // or 'vivid'
      });

      if (response.data && response.data[0]) {
        return {
          url: response.data[0].url || '',
          model: 'dall-e-3',
          metadata: response.data[0],
        };
      }
      throw new Error('No data in response');
    } catch (error) {
      console.error('DALL-E 3 error:', error);
      throw new Error(
        `DALL-E 3 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // GPT Image генератор
  async generateWithGPTImage(
    prompt: string,
    negativePrompt?: string,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    steps?: number,
    aspectRatio?: string
  ): Promise<MediaGenerationResult> {
    try {
      // Map aspect ratio to DALL-E supported formats
      let size = '1024x1024'; // default
      if (aspectRatio === '16:9') size = '1792x1024';
      else if (aspectRatio === '9:16') size = '1024x1792';
      else if (aspectRatio === '1:1') size = '1024x1024'; // square
      else if (aspectRatio === '4:5') size = '1024x1280';
      else if (aspectRatio === '3:2') size = '1536x1024';

      const response = await this.openai.images.generate({
        model: 'dall-e-3', // GPT Image пока использует DALL-E
        prompt: `${prompt}${negativePrompt ? `\nNegative prompt: ${negativePrompt}` : ''}`,
        n: 1,
        size: size as any,
        quality: quality === 'hd' || quality === 'premium' ? 'hd' : 'standard',
        style: 'natural' // or 'vivid'
      });

      if (response.data && response.data[0]) {
        return {
          url: response.data[0].url || '',
          model: 'gpt-image',
          metadata: response.data[0],
        };
      }
      throw new Error('No data in response');
    } catch (error) {
      console.error('GPT Image error:', error);
      throw new Error(
        `GPT Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Imagen 3 генератор
  async generateWithImagen3(
    prompt: string,
    negativePrompt?: string,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    steps?: number,
    aspectRatio?: string
  ): Promise<MediaGenerationResult> {
    try {
      const imageModel = this.vertexAI.getGenerativeModel({
        model: 'imagen-3.0-generate-001',
      });

      // Construct the request with advanced parameters
      // Note: The Vertex AI Node.js SDK structure for Imagen might vary, 
      // but we will map parameters to the standard generation config.
      const generationConfig: any = {
        sampleCount: 1,
      };

      if (aspectRatio) {
        generationConfig.aspectRatio = aspectRatio;
      }

      if (seed !== undefined) {
        generationConfig.seed = seed;
      }

      // Add negative prompt to the request if supported or append to prompt
      // For Imagen, it's often part of the content or a separate field depending on version
      const fullPrompt = negativePrompt
        ? `${prompt}\n\nNegative prompt: ${negativePrompt}`
        : prompt;

      const request = {
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig,
      };

      const response = await imageModel.generateContent(request);

      if (
        response.response &&
        response.response.candidates &&
        response.response.candidates[0]
      ) {
        const candidate = response.response.candidates[0];

        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;

              return {
                url: imageUrl,
                model: 'imagen-3',
                metadata: {
                  prompt,
                  status: 'success',
                  generated: true,
                  timestamp: new Date().toISOString(),
                  mimeType: part.inlineData.mimeType || 'image/png',
                  seed,
                  quality
                },
              };
            }
          }
        }
      }
      throw new Error('No data in response');
    } catch (error) {
      console.error('Imagen 3 error:', error);
      throw new Error(
        `Imagen 3 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Veo 3 генератор видео
  async generateWithVeo3(
    prompt: string,
    duration: number = 10,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    aspectRatio?: string,
    negativePrompt?: string
  ): Promise<MediaGenerationResult> {
    try {
      const videoModel = this.vertexAI.getGenerativeModel({
        model: 'veo-3.0-generate-001',
      });

      const fullPrompt = negativePrompt
        ? `${prompt}\n\nNegative prompt: ${negativePrompt}`
        : prompt;

      const request = {
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          seed: seed,
          // Aspect ratio mapping for video if supported
        } as any
      };

      const response = await videoModel.generateContent(request);

      if (
        response.response &&
        response.response.candidates &&
        response.response.candidates[0]
      ) {
        const candidate = response.response.candidates[0];

        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const videoUrl = `data:${part.inlineData.mimeType || 'video/mp4'};base64,${part.inlineData.data}`;

              return {
                url: videoUrl,
                model: 'veo-3',
                metadata: {
                  prompt,
                  status: 'success',
                  generated: true,
                  timestamp: new Date().toISOString(),
                  mimeType: part.inlineData.mimeType || 'video/mp4',
                  duration,
                  seed
                },
              };
            }
          }
        }
      }
      throw new Error('No data in response');
    } catch (error) {
      console.error('Veo 3 error:', error);
      throw new Error(
        `Veo 3 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Gemini 3 Image Pro (Primary)
  async generateWithGemini3ImagePro(
    prompt: string,
    negativePrompt?: string,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    steps?: number,
    aspectRatio?: string
  ): Promise<MediaGenerationResult> {
    try {
      // Using Vertex AI Gemini model for image generation
      const model = this.vertexAI.getGenerativeModel({
        model: 'gemini-3-image-pro-001', // Hypothetical model ID
      });

      const fullPrompt = negativePrompt
        ? `${prompt}\n\nNegative prompt: ${negativePrompt}\nStyle: June Six Fine Dining, low-key lighting, soft warm light, minimalism`
        : `${prompt}\nStyle: June Six Fine Dining, low-key lighting, soft warm light, minimalism`;

      // Default to 4:5 aspect ratio for June Six aesthetic
      const effectiveAspectRatio = aspectRatio || '4:5';

      // ... Implementation similar to Imagen but targeting Gemini Image capabilities
      // For now, mapping to Imagen 3 backend as placeholder if Gemini Image API isn't distinct yet
      // But assuming it is distinct:

      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          // Gemini Image specific params
          candidateCount: 1,
          seed: seed,
          aspectRatio: effectiveAspectRatio
        } as any
      });

      if (response.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const part = response.response.candidates[0].content.parts[0];
        const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        return {
          url: imageUrl,
          model: 'gemini-3-image-pro',
          metadata: { prompt, status: 'success', generated: true, timestamp: new Date().toISOString() }
        };
      }
      throw new Error('No image data in Gemini response');

    } catch (error) {
      console.error('Gemini 3 Image Pro error:', error);
      throw new Error(`Gemini 3 Image Pro generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Imagen 4 Generator
  async generateWithImagen4(
    prompt: string,
    negativePrompt?: string,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    steps?: number,
    aspectRatio?: string
  ): Promise<MediaGenerationResult> {
    try {
      const model = this.vertexAI.getGenerativeModel({ model: 'imagen-4.0-generate-001' });
      // ... Implementation
      const fullPrompt = negativePrompt ? `${prompt}\n\nNegative prompt: ${negativePrompt}` : prompt;
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { sampleCount: 1, seed, aspectRatio } as any
      });

      if (response.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const part = response.response.candidates[0].content.parts[0];
        return {
          url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          model: 'imagen-4',
          metadata: { prompt, status: 'success' }
        };
      }
      throw new Error('No data in Imagen 4 response');
    } catch (error) {
      console.error('Imagen 4 error:', error);
      throw new Error(`Imagen 4 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Veo 3.1 Generator
  async generateWithVeo3_1(
    prompt: string,
    duration: number = 10,
    quality?: 'standard' | 'hd' | 'premium',
    seed?: number,
    aspectRatio?: string,
    negativePrompt?: string
  ): Promise<MediaGenerationResult> {
    try {
      const model = this.vertexAI.getGenerativeModel({ model: 'veo-3.1-generate-001' });
      const fullPrompt = negativePrompt ? `${prompt}\n\nNegative prompt: ${negativePrompt}` : prompt;
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { seed } as any
      });
      if (response.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const part = response.response.candidates[0].content.parts[0];
        return {
          url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          model: 'veo-3.1',
          metadata: { prompt, status: 'success', duration }
        };
      }
      throw new Error('No data in Veo 3.1 response');
    } catch (error) {
      console.error('Veo 3.1 error:', error);
      throw new Error(`Veo 3.1 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Основная функция генерации с fallback логикой
  async generateMedia(
    params: MediaGenerationParams,
    mediaType: 'image' | 'video'
  ): Promise<MediaGenerationResult> {
    console.log(`🎨 Generating ${mediaType} with prompt: ${params.prompt}`);

    // Сначала улучшаем промпт
    const enhancement = await this.enhancePrompt(params.prompt, mediaType);
    console.log(`✨ Enhanced prompt: ${enhancement.enhancedPrompt}`);
    console.log(`🎯 Optimal generator: ${enhancement.optimalGenerator}`);

    // Определяем порядок генераторов с fallback
    // v3.0 Routing Logic
    let generators: string[] = [];

    if (mediaType === 'image') {
      const requested = params.generator || enhancement.optimalGenerator;
      // Default routing based on v3.0 specs if not explicitly requested
      if (requested === 'auto' || !requested) {
        // Simple heuristic based on prompt keywords (could be more advanced)
        if (params.prompt.toLowerCase().includes('edit')) generators = ['gemini-3-image-pro'];
        else if (params.prompt.toLowerCase().includes('realism') || params.prompt.toLowerCase().includes('photo')) generators = ['gemini-3-image-pro', 'imagen-4'];
        else if (params.prompt.toLowerCase().includes('mockup')) generators = ['gpt-image-1'];
        else generators = ['gemini-3-image-pro', 'imagen-4', 'gpt-image-1'];
      } else {
        generators = [requested, 'gemini-3-image-pro', 'imagen-4', 'gpt-image-1'];
      }
    } else {
      // Video
      const requested = params.generator || enhancement.optimalGenerator;
      if (requested === 'auto' || !requested) {
        generators = ['veo-3.1', 'veo-3'];
      } else {
        generators = [requested, 'veo-3.1', 'veo-3'];
      }
    }

    // Deduplicate
    generators = [...new Set(generators)];

    let lastError: Error | null = null;

    for (const generator of generators) {
      try {
        console.log(`🔄 Trying generator: ${generator}`);

        switch (generator) {
          case 'gemini-3-image-pro':
            return await this.generateWithGemini3ImagePro(
              enhancement.enhancedPrompt,
              enhancement.negativePrompt,
              params.quality,
              params.seed,
              params.steps,
              params.aspectRatio
            );

          case 'imagen-4':
            return await this.generateWithImagen4(
              enhancement.enhancedPrompt,
              enhancement.negativePrompt,
              params.quality,
              params.seed,
              params.steps,
              params.aspectRatio
            );

          case 'gpt-image-1':
          case 'gpt-image': // alias
            return await this.generateWithGPTImage(
              enhancement.enhancedPrompt,
              enhancement.negativePrompt,
              params.quality,
              params.seed,
              params.steps,
              params.aspectRatio
            );

          case 'dall-e-3': // Legacy fallback
            return await this.generateWithDALLE3(
              enhancement.enhancedPrompt,
              enhancement.negativePrompt,
              params.quality,
              params.seed,
              params.steps,
              params.aspectRatio
            );

          case 'imagen-3': // Legacy fallback
            return await this.generateWithImagen3(
              enhancement.enhancedPrompt,
              enhancement.negativePrompt,
              params.quality,
              params.seed,
              params.steps,
              params.aspectRatio
            );

          case 'veo-3.1':
            return await this.generateWithVeo3_1(
              enhancement.enhancedPrompt,
              params.durationSec || 10,
              params.quality,
              params.seed,
              params.aspectRatio,
              enhancement.negativePrompt
            );

          case 'veo-3':
            return await this.generateWithVeo3(
              enhancement.enhancedPrompt,
              params.durationSec || 10,
              params.quality,
              params.seed,
              params.aspectRatio,
              enhancement.negativePrompt
            );

          default:
            // If unknown, try to map to closest
            if (generator.includes('gemini')) {
              return await this.generateWithGemini3ImagePro(enhancement.enhancedPrompt, enhancement.negativePrompt, params.quality, params.seed, params.steps, params.aspectRatio);
            }
            throw new Error(`Unknown generator: ${generator}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`❌ Generator ${generator} failed:`, lastError.message);
        continue;
      }
    }

    // Если все генераторы не сработали
    throw lastError || new Error('All media generators failed');
  }

  // MCP инструменты для интеграции с агентами
  getMCPTools() {
    return {
      generate_image: {
        name: 'generate_image',
        description: 'Сгенерировать изображение с помощью AI',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Описание изображения' },
            negativePrompt: {
              type: 'string',
              description: 'Что не должно быть на изображении',
            },
            generator: {
              type: 'string',
              enum: ['gemini-3-image-pro', 'imagen-4', 'gpt-image-1', 'dall-e-3', 'auto'],
              description: 'Генератор для использования',
              default: 'auto',
            },
          },
          required: ['prompt'],
        },
      },

      generate_video: {
        name: 'generate_video',
        description: 'Сгенерировать видео с помощью AI',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Описание видео' },
            durationSec: {
              type: 'number',
              description: 'Длительность в секундах',
              minimum: 1,
              maximum: 60,
              default: 10,
            },
            generator: {
              type: 'string',
              enum: ['veo-3.1', 'veo-3', 'auto'],
              description: 'Генератор для использования',
              default: 'auto',
            },
          },
          required: ['prompt'],
        },
      },

      enhance_prompt: {
        name: 'enhance_prompt',
        description: 'Улучшить промпт для генерации медиа',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Исходный промпт' },
            mediaType: {
              type: 'string',
              enum: ['image', 'video'],
              description: 'Тип медиа',
            },
          },
          required: ['prompt', 'mediaType'],
        },
      },
    };
  }
}

// Singleton экземпляр
let enhancedMediaInstance: EnhancedMediaTool | null = null;

export function getEnhancedMediaTool(): EnhancedMediaTool {
  if (!enhancedMediaInstance) {
    enhancedMediaInstance = new EnhancedMediaTool();
  }
  return enhancedMediaInstance;
}
