export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    model?: string;
    sqlQuery?: string;
    debugSql?: string;
    queryResults?: any[];
    imageUrl?: string;
    videoUrl?: string;
    chartType?: string;
    error?: string;
  };
  createdAt: string;
}

export interface FileUploadResult {
  id: string;
  filename: string;
  originalName: string;
  tableName?: string;
  processed: boolean;
  size: string;
}

export interface MediaGenerationRequest {
  type: 'image' | 'video';
  prompt: string;
  model: string;
  parameters?: {
    size?: string;
    quality?: string;
  };
}
