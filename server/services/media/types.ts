export interface MediaGenerationRequest {
  prompt: string;
  userId: string;
  provider: string;
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
  createdAt?: string;
  updatedAt?: string;
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

export interface MediaAsset {
  id: string;
  userId: string;
  provider: string;
  prompt: string;
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assetUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateImageRequest {
  provider: 'dalle' | 'imagen';
  prompt: string;
  options?: {
    resolution?: string;
    quality?: string;
  };
}

export interface GenerateVideoRequest {
  provider: 'veo';
  prompt: string;
  options?: {
    duration?: number;
    style?: string;
  };
}

export interface AssetsListResponse {
  total: number;
  assets: Array<{
    id: string;
    provider: string;
    prompt: string;
    status: string;
    assetUrl?: string;
    createdAt: string;
  }>;
}