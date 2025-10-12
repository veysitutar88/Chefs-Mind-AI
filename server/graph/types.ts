// server/graph/types.ts
export type Role = "user" | "assistant" | "system";

export type Agent = "Chef" | "Accountant" | "Researcher" | "Media" | "Quality";

export interface Message {
  role: Role;
  content: string;
  meta?: Record<string, unknown>;
}

export type MediaKind = "image" | "video" | "text";

export interface Plan {
  kind: MediaKind;
  provider?: string;
  template?: any;           // сюда enhancer может положить провайдер-payload
}

export interface GraphState {
  input: string;            // последний пользовательский ввод
  messages: Message[];      // история
  agent?: Agent;            // выбранный агент
  plan?: Plan;              // что делать дальше (медиа/текст)
  meta?: Record<string, unknown>;
}
