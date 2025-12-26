export type AgentId = 'souschef' | 'gastrocount' | 'gastromind' | 'foodframe';

export interface AgentConfig {
    id: AgentId;
    title: string;
    subtitle: string;
    iconName: 'chef_hat' | 'calculator' | 'compass' | 'image';
    icon?: string;
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
