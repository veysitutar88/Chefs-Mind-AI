// server/graph/types.ts
export type Role = 'user' | 'assistant' | 'system';

export type Agent = 'Chef' | 'Accountant' | 'Researcher' | 'Media' | 'Quality';

export interface Message {
  role: Role;
  content: string;
  meta?: Record<string, unknown>;
}

export type MediaKind = 'image' | 'video' | 'text';

export interface Plan {
  kind: MediaKind;
  provider?: string;
  template?: any; // сюда enhancer может положить провайдер-payload
}

export interface QualityCheck {
  passed: boolean;
  reason?: string; // причина неудачи (одна строка)
  score?: number; // оценка качества
}

export interface GraphError {
  type: string;
  message: string;
  score?: number;
}

export interface GraphState {
  input: string; // последний пользовательский ввод
  messages: Message[]; // история
  agent?: Agent; // выбранный агент
  plan?: Plan; // что делать дальше (медиа/текст)
  response?: string; // сгенерированный ответ (для QA проверки)
  qualityCheck?: QualityCheck; // результаты проверки качества
  errors?: GraphError[]; // ошибки выполнения
  meta?: Record<string, unknown>;
}
