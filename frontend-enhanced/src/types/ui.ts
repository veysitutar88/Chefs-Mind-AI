/* =========================================================
   Chef's AI OS — UICanon v2.5 — Core Types
   ========================================================= */

/* ---------------------------------------------------------
   Agents (4 canonical — LOCKED)
--------------------------------------------------------- */
export type AgentId = 'souschef' | 'gastrocount' | 'gastromind' | 'foodframe';

export interface AgentConfig {
  id: AgentId;
  label: string;
  subtitle: string;
  icon: string;
  iconName: 'chef_hat' | 'calculator' | 'compass' | 'image';
  isMediaAgent?: boolean;
}

/* ---------------------------------------------------------
   Chat
--------------------------------------------------------- */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: number;
  agentId?: AgentId;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface ChatSession {
  sessionId: string;
  messages: Message[];
  agentId: AgentId;
}

/* ---------------------------------------------------------
   Files & Todos (right sidebar widgets)
--------------------------------------------------------- */
export interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'spreadsheet' | 'other';
  date: string;
  size?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

/* ---------------------------------------------------------
   FoodFrame — Media Generation
--------------------------------------------------------- */
export type MediaModel = 'gpt-image' | 'gemini-image' | 'gemini-video' | 'veo3';
export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
export type OutputResolution = '1K' | '2K' | '4K';
export type GenerationType = 'image' | 'video';

export interface MediaOptions {
  model: MediaModel;
  aspectRatio: AspectRatio;
  resolution: OutputResolution;
  type: GenerationType;
  preset?: string;
}

export interface MediaJob {
  id: string;
  status: 'pending' | 'generating' | 'done' | 'error';
  type: GenerationType;
  prompt: string;
  resultUrl?: string;
  createdAt: number;
  error?: string;
}

/* ---------------------------------------------------------
   Overlay System
--------------------------------------------------------- */
export type OverlayType =
  | 'calendar'
  | 'notes-tasks'
  | 'search'
  | 'recent-chats'
  | 'files'
  | 'preset-library'
  | 'settings'
  | null;

/* ---------------------------------------------------------
   Right Sidebar Mode
--------------------------------------------------------- */
export type RightSidebarMode = 'tools' | 'foodframe';

/* ---------------------------------------------------------
   UI State
--------------------------------------------------------- */
export interface AppState {
  activeAgentId: AgentId;
  activeOverlay: OverlayType;
  rightSidebarMode: RightSidebarMode;
  isMobileMenuOpen: boolean;
}

/* ---------------------------------------------------------
   Tool actions (right sidebar Tools section)
--------------------------------------------------------- */
export type ToolAction =
  | 'calendar'
  | 'notes-tasks'
  | 'files'
  | 'search'
  | 'recent-chats';

export interface ToolItem {
  id: ToolAction;
  label: string;
  icon: string;
  shortcut?: string;
}
