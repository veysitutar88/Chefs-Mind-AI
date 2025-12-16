
export type AgentId = 'sous_chef' | 'gastro_count' | 'gastro_mind' | 'food_frame';

export interface AgentConfig {
  id: AgentId;
  title: string;
  subtitle: string;
  iconName: 'chef_hat' | 'calculator' | 'compass' | 'image';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  // Optional attachments/metadata simulated
  attachments?: string[]; 
}

export interface ChatSession {
  messages: Message[];
  sessionId: string;
}

export interface ChatState {
  [key: string]: ChatSession; // key is AgentId
}

export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'doc' | 'pdf';
  date: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}
