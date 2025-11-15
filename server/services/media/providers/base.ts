import { MediaGenerationRequest, MediaGenerationResponse, JobStatusResponse, MediaProvider } from './types.js';

/**
 * Базовый класс для всех провайдеров медиа-генерации.
 * Содержит общую логику асинхронной обработки задач и симуляцию прогресса.
 */
export abstract class BaseMediaProvider implements MediaProvider {
  abstract readonly name: string;

  protected async simulateProgress(jobId: string, durationMs: number = 3000): Promise<void> {
    // Симулируем постепенный прогресс
    const steps = 5;
    const stepDuration = durationMs / steps;
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      // Здесь можно добавить логику сохранения прогресса в БД
      console.log(`[${this.name}] Job ${jobId} progress: ${(i / steps) * 100}%`);
    }
  }

  protected generateMockAssetUrl(jobId: string, type: 'image' | 'video'): string {
    const timestamp = Date.now();
    const filename = `${jobId}-${timestamp}.${type === 'image' ? 'png' : 'mp4'}`;
    return `/assets/generated/${filename}`;
  }

  generate(request: MediaGenerationRequest): Promise<MediaGenerationResponse> {
    const jobId = `job-${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return Promise.resolve({
      jobId,
      status: 'pending',
      provider: this.name,
      estimatedCompletionTime: 3, // 3 секунды для симуляции
    });
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    // Базовая реализация - симулируем разные статусы
    // В реальной реализации здесь был бы запрос к API провайдера
    return {
      status: 'completed',
      progress: 100,
      assetUrl: this.generateMockAssetUrl(jobId, 'image'), // По умолчанию изображение
    };
  }
}

/**
 * Фабрика для получения провайдера по имени.
 * В реальной реализации здесь может быть логика для выбора провайдера
 * в зависимости от доступности, нагрузки и других факторов.
 */
export function getProvider(providerName: string): MediaProvider | null {
  // Заглушка - в реальной реализации здесь была бы мапа с фабриками
  console.warn(`Media provider '${providerName}' not implemented yet`);
  return null;
}