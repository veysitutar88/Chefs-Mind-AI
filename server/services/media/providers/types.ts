
export interface MediaGenerationRequest {
  prompt: string;
  userId: string;
  options?: Record<string, any>; // Продвинутые опции: разрешение, стиль и т.д.
}

export interface MediaGenerationResponse {
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  provider: string;
  estimatedCompletionTime?: number; // в секундах
}

export interface JobStatusResponse {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number; // от 0 до 100
  assetUrl?: string;
  error?: string;
}

export interface MediaProvider {
  /**
   * Имя провайдера (e.g., "dalle", "veo").
   */
  readonly name: string;

  /**
   * Инициирует задачу генерации медиа.
   * @param request - Данные для запроса генерации.
   * @returns Promise с информацией о запущенной задаче.
   */
  generate(request: MediaGenerationRequest): Promise<MediaGenerationResponse>;

  /**
   * Проверяет статус задачи генерации.
   * @param jobId - Идентификатор задачи.
   * @returns Promise со статусом задачи.
   */
  getJobStatus(jobId: string): Promise<JobStatusResponse>;
}

export type ProviderType = 'dalle' | 'imagen' | 'veo';

export interface GenerateImageRequest {
  provider: ProviderType;
  prompt: string;
  options?: {
    resolution?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'hd' | 'standard';
    style?: 'vivid' | 'natural';
  };
}

export interface GenerateVideoRequest {
  provider: ProviderType;
  prompt: string;
  options?: {
    duration?: 5 | 10 | 15;
    style?: 'cinematic' | 'realistic' | 'artistic';
    aspectRatio?: '16:9' | '9:16' | '1:1';
  };
}

export interface AssetListRequest {
  limit?: number;
  offset?: number;
  provider?: ProviderType;
}

export interface AssetListResponse {
  total: number;
  assets: Array<{
    id: string;
    userId: string;
    provider: string;
    prompt: string;
    status: string;
    assetUrl?: string;
    createdAt: string;
  }>;
}