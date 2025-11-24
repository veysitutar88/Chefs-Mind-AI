export type AgentId = 'sous_chef' | 'gastro_count' | 'gastro_mind' | 'food_frame';

export interface AgentConfig {
    id: AgentId;
    title: string;
    subtitle: string;
    iconName: 'chef_hat' | 'calculator' | 'compass' | 'image';
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: number;
}

export interface ChatSession {
    sessionId: string;
    messages: Message[];
}

export interface FileItem {
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
    date: string;
}

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}
