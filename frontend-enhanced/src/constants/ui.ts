/* =========================================================
   Chef's AI OS — UICanon v2.5 — UI Constants
   ========================================================= */
import { AgentConfig, FileItem, TodoItem, ToolItem } from '@/types/ui';

/* ---------------------------------------------------------
   4 Canonical Agents (LOCKED — UICanon v2.5)
--------------------------------------------------------- */
export const AGENTS: AgentConfig[] = [
  {
    id: 'souschef',
    label: 'SousChef',
    subtitle: 'Recipes • Prep • Plating',
    icon: '👨‍🍳',
    iconName: 'chef_hat',
    isMediaAgent: false,
  },
  {
    id: 'gastrocount',
    label: 'GastroCount',
    subtitle: 'Costs • Inventory • Reports',
    icon: '🧮',
    iconName: 'calculator',
    isMediaAgent: false,
  },
  {
    id: 'gastromind',
    label: 'GastroMind',
    subtitle: 'Research • Trends • Insights',
    icon: '🔍',
    iconName: 'compass',
    isMediaAgent: false,
  },
  {
    id: 'foodframe',
    label: 'FoodFrame',
    subtitle: 'Photos • Video • Creative',
    icon: '🎨',
    iconName: 'image',
    isMediaAgent: true,
  },
];

/* ---------------------------------------------------------
   Tools (Right Sidebar — Tools mode)
   Opens corresponding overlay via OverlayType
--------------------------------------------------------- */
export const TOOLS: ToolItem[] = [
  { id: 'calendar',      label: 'Calendar',     icon: '📅', shortcut: '⌘1' },
  { id: 'notes-tasks',   label: 'Notes & Tasks', icon: '📝', shortcut: '⌘2' },
  { id: 'files',         label: 'Files',         icon: '📁', shortcut: '⌘3' },
  { id: 'search',        label: 'Search',        icon: '🔍', shortcut: '⌘F' },
  { id: 'recent-chats',  label: 'Recent Chats',  icon: '💬', shortcut: '⌘R' },
];

/* ---------------------------------------------------------
   Text Models (Chat model selector — all text agents + FoodFrame chat)
--------------------------------------------------------- */
export const TEXT_MODELS = [
  { id: 'auto',        label: 'Auto',        description: 'Intelligent routing' },
  { id: 'chatgpt',     label: 'ChatGPT',     description: 'GPT-4o' },
  { id: 'gemini',      label: 'Gemini',      description: 'Gemini 2.0 Flash' },
  { id: 'perplexity',  label: 'Perplexity',  description: 'Sonar Pro' },
] as const;

export type TextModelId = typeof TEXT_MODELS[number]['id'];

/* ---------------------------------------------------------
   FoodFrame — Media Models
   (Independent from text model selector)
--------------------------------------------------------- */
export interface MediaModelDef {
  id: string;
  label: string;
  type: 'image' | 'video';
  reserved?: boolean;
}

export const MEDIA_MODELS: MediaModelDef[] = [
  { id: 'gpt-image',     label: 'GPT-Image',    type: 'image' },
  { id: 'gemini-image',  label: 'Gemini Image', type: 'image' },
  { id: 'gemini-video',  label: 'Gemini Video', type: 'video' },
  { id: 'veo3',          label: 'Veo 3',        type: 'video', reserved: true },
];

export const ASPECT_RATIOS = ['1:1', '4:5', '16:9', '9:16'] as const;
export const OUTPUT_RESOLUTIONS = ['1K', '2K', '4K'] as const;

/* ---------------------------------------------------------
   Sample seed data
--------------------------------------------------------- */
export const INITIAL_FILES: FileItem[] = [
  { id: '1', name: 'Summer_Menu_Draft.pdf',     type: 'pdf',   date: '2h ago',  size: '1.2 MB' },
  { id: '2', name: 'Plating_Concept_04.jpg',    type: 'image', date: '1d ago',  size: '3.8 MB' },
  { id: '3', name: 'Inventory_Report_Aug.xlsx', type: 'spreadsheet', date: '2d ago', size: '540 KB' },
  { id: '4', name: 'Supplier_Contracts_Q3.pdf', type: 'pdf',   date: '3d ago',  size: '2.1 MB' },
];

export const INITIAL_TODOS: TodoItem[] = [
  { id: '1', text: 'Review weekend prep list',   completed: false, priority: 'high' },
  { id: '2', text: 'Order truffles from supplier', completed: true,  priority: 'medium' },
  { id: '3', text: 'Update seasonal menu',        completed: false, priority: 'medium' },
  { id: '4', text: 'Check inventory stock levels', completed: false, priority: 'low' },
];
