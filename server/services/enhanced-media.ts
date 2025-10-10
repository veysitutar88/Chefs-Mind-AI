import OpenAI from 'openai';
import { VertexAI } from '@google-cloud/vertexai';

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
  async enhancePrompt(originalPrompt: string, mediaType: 'image' | 'video'): Promise<{
    enhancedPrompt: string;
    negativePrompt?: string;
    suggestions: string[];
    optimalGenerator: string;
  }> {
    try {
      const promptEnhancer = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const systemPrompt = `Ты - эксперт по созданию промптов для генерации ${mediaType === 'image' ? 'изображений' : 'видео'}. 
Твоя задача - улучшить исходный промпт, сделав его более детальным и эффективным.

Верни JSON с полями:
- enhancedPrompt: улучшенный промпт
- negativePrompt: негативный промпт (что НЕ должно быть на изображении/видео)
- suggestions: массив с 3-5 дополнительными идеями
- optimalGenerator: какой генератор лучше всего подойдет (dall-e-3, gpt-image, imagen-3, veo-3)`;

      const response = await promptEnhancer.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Временно GPT-4
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Улучши этот промпт для генерации ${mediaType}: ${originalPrompt}` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        enhancedPrompt: result.enhancedPrompt || originalPrompt,
        negativePrompt: result.negativePrompt,
        suggestions: result.suggestions || [],
        optimalGenerator: result.optimalGenerator || (mediaType === 'image' ? 'dall-e-3' : 'veo-3')
      };
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return {
        enhancedPrompt: originalPrompt,
        suggestions: [],
        optimalGenerator: mediaType === 'image' ? 'dall-e-3' : 'veo-3'
      };
    }
  }

  // DALL-E 3 генератор
  async generateWithDALLE3(prompt: string, negativePrompt?: string): Promise<{
    url: string;
    model: 'dall-e-3';
    metadata: any;
  }> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid',
        response_format: 'url'
      });

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E 3');
      }

      return {
        url: imageUrl,
        model: 'dall-e-3',
        metadata: {
          revisedPrompt: response.data[0].revised_prompt,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        }
      };
    } catch (error) {
      console.error('DALL-E 3 error:', error);
      throw new Error(`DALL-E 3 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // GPT Image генератор
  async generateWithGPTImage(prompt: string, negativePrompt?: string): Promise<{
    url: string;
    model: 'gpt-image';
    metadata: any;
  }> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3', // GPT Image пока использует DALL-E
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      });

      const imageUrl = response.data[0].url;
      if (!imageUrl) {
        throw new Error('No image URL returned from GPT Image');
      }

      return {
        url: imageUrl,
        model: 'gpt-image',
        metadata: {
          generator: 'gpt-image-dall-e',
          fallback: 'using-dall-e-3'
        }
      };
    } catch (error) {
      console.error('GPT Image error:', error);
      throw new Error(`GPT Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Imagen 3 генератор
  async generateWithImagen3(prompt: string, negativePrompt?: string): Promise<{
    url: string;
    model: 'imagen-3';
    metadata: any;
  }> {
    try {
      const imageModel = this.vertexAI.getGenerativeModel({
        model: 'imagen-3.0-generate-001',
      });

      // Исправленный вызов API
      const response = await imageModel.generateContent({
        prompt: prompt,
        generationConfig: {
          numberOfImages: 1,
          aspectRatio: '1:1',
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult'
        }
      });

      const image = response.response.candidates?.[0];
      if (!image || !image.content) {
        throw new Error('No image generated by Imagen 3');
      }

      return {
        url: image.content.parts?.[0]?.fileUri || image.content.text || '',
        model: 'imagen-3',
        metadata: {
          safetyRatings: image.safetyRatings
        }
      };
    } catch (error) {
      console.error('Imagen 3 error:', error);
      throw new Error(`Imagen 3 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Veo 3 генератор видео
  async generateWithVeo3(prompt: string, duration: number = 10): Promise<{
    url: string;
    model: 'veo-3';
    metadata: any;
  }> {
    try {
      const videoModel = this.vertexAI.getGenerativeModel({
        model: 'veo-3.0-generate-001',
      });

      // Исправленный вызов API
      const response = await videoModel.generateContent({
        prompt: prompt,
        generationConfig: {
          durationSeconds: duration,
          aspectRatio: '16:9',
          personGeneration: 'allow_adult'
        }
      });

      const video = response.response.candidates?.[0];
      if (!video || !video.content) {
        throw new Error('No video generated by Veo 3');
      }

      return {
        url: video.content.parts?.[0]?.fileUri || video.content.text || '',
        model: 'veo-3',
        metadata: {
          duration: duration,
          aspectRatio: '16:9',
          safetyRatings: video.safetyRatings
        }
      };
    } catch (error) {
      console.error('Veo 3 error:', error);
      throw new Error(`Veo 3 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Основная функция генерации с fallback логикой
  async generateMedia(
    prompt: string, 
    mediaType: 'image' | 'video',
    preferredGenerator?: string,
    negativePrompt?: string
  ): Promise<{
    url: string;
    model: string;
    metadata: any;
    fallbackUsed?: boolean;
  }> {
    console.log(`🎨 Generating ${mediaType} with prompt: ${prompt}`);

    // Сначала улучшаем промпт
    const enhancement = await this.enhancePrompt(prompt, mediaType);
    console.log(`✨ Enhanced prompt: ${enhancement.enhancedPrompt}`);
    console.log(`🎯 Optimal generator: ${enhancement.optimalGenerator}`);

    // Определяем порядок генераторов с fallback
    const generators = mediaType === 'image' 
      ? [
          preferredGenerator || enhancement.optimalGenerator,
          'dall-e-3',
          'imagen-3',
          'gpt-image'
        ].filter((gen, index, arr) => arr.indexOf(gen) === index)
      : [
          preferredGenerator || enhancement.optimalGenerator,
          'veo-3'
        ];

    let lastError: Error | null = null;

    for (const generator of generators) {
      try {
        console.log(`🔄 Trying generator: ${generator}`);
        
        switch (generator) {
          case 'dall-e-3':
            return await this.generateWithDALLE3(enhancement.enhancedPrompt, enhancement.negativePrompt);
          
          case 'gpt-image':
            return await this.generateWithGPTImage(enhancement.enhancedPrompt, enhancement.negativePrompt);
          
          case 'imagen-3':
            return await this.generateWithImagen3(enhancement.enhancedPrompt, enhancement.negativePrompt);
          
          case 'veo-3':
            return await this.generateWithVeo3(enhancement.enhancedPrompt);
          
          default:
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
            negativePrompt: { type: 'string', description: 'Что не должно быть на изображении' },
            generator: { 
              type: 'string', 
              enum: ['dall-e-3', 'gpt-image', 'imagen-3', 'auto'],
              description: 'Генератор для использования',
              default: 'auto'
            }
          },
          required: ['prompt']
        }
      },

      generate_video: {
        name: 'generate_video',
        description: 'Сгенерировать видео с помощью AI',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Описание видео' },
            duration: { 
              type: 'number', 
              description: 'Длительность в секундах',
              minimum: 1,
              maximum: 60,
              default: 10
            },
            generator: { 
              type: 'string', 
              enum: ['veo-3', 'auto'],
              description: 'Генератор для использования',
              default: 'auto'
            }
          },
          required: ['prompt']
        }
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
              description: 'Тип медиа'
            }
          },
          required: ['prompt', 'mediaType']
        }
      }
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