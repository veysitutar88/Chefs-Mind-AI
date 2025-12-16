// Общие типы для всего приложения
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  model?: string;
  meta?: Record<string, unknown>;
}

export type AgentType =
  | 'chef'
  | 'accountant'
  | 'researcher'
  | 'media'
  | 'quality'
  | 'auto';

export interface EnhancedGraphState {
  input: string;
  messages: Message[];
  agent?: AgentType;
  plan?: Plan;
  meta?: Record<string, unknown>;
  currentAgent?: string;
  usedModel?: string;
  metadata?: Record<string, unknown>;
  correctionLoops?: number;
  fallbackUsed?: boolean;
  provenanceData?: any;
  confidence?: number;
  agentOutcome?: 'complete' | 'error' | string;
}

export interface Plan {
  kind: 'image' | 'video' | 'text';
  provider?: string;
  template?: any;
}

// Типы для потокового ответа
export interface EnhancedStreamChunk {
  type:
    | 'content'
    | 'metadata'
    | 'error'
    | 'complete'
    | 'tool_call'
    | 'fact_check'
    | 'quality_control';
  data?: any;
  content?: string;
  agent?: string;
  model?: string;
  error?: string;
  toolResult?: any;
  factCheckResult?: any;
  qualityScore?: number;
  fallbackUsed?: boolean;
}

// Типы для медиа-генерации
export interface MediaGenerationParams {
  prompt: string;
  durationSec?: number;
  generator?: string;
  negativePrompt?: string;
  quality?: 'standard' | 'hd' | 'premium';
  seed?: number;
  steps?: number;
  aspectRatio?: string;
}

export interface MediaGenerationResult {
  url: string;
  model: string;
  metadata: any;
  fallbackUsed?: boolean;
}

export interface EnhancedPromptResult {
  enhancedPrompt: string;
  negativePrompt?: string;
  suggestions: string[];
  optimalGenerator: string;
}

// Типы для Google MCP
export interface GoogleMCPService {
  createCalendarEvent: (params: any) => Promise<any>;
  createDocument: (title: string, content: string) => Promise<any>;
  createSpreadsheet: (title: string, headers: string[]) => Promise<any>;
  // Добавим индексную сигнатуру для других методов
  [key: string]: any;
}

// Типы для инструментов
export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}
