'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — AppLayout
   3-Column: Left(Agents) | Center(Chat/Canvas) | Right(Tools|FoodFrame)
   ========================================================= */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebarTools } from './RightSidebarTools';
import { RightSidebarFoodFrame } from './RightSidebarFoodFrame';
import { ToolOverlayShell } from '@/components/overlays/ToolOverlayShell';
import {
  AgentId, OverlayType, MediaOptions, RightSidebarMode,
  TodoItem, FileItem,
} from '@/types/ui';
import { INITIAL_TODOS, INITIAL_FILES } from '@/constants/ui';

/* ---------------------------------------------------------
   App Context — shared state across layout
--------------------------------------------------------- */
export interface AppContextValue {
  activeAgentId: AgentId;
  setActiveAgentId: (id: AgentId) => void;
  activeOverlay: OverlayType;
  openOverlay: (type: OverlayType) => void;
  closeOverlay: () => void;
  rightSidebarMode: RightSidebarMode;
  mediaOptions: MediaOptions;
  setMediaOptions: React.Dispatch<React.SetStateAction<MediaOptions>>;
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  files: FileItem[];
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppLayout');
  return ctx;
}

/* ---------------------------------------------------------
   AppLayout
--------------------------------------------------------- */
interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [activeAgentId, setActiveAgentIdState] = useState<AgentId>('souschef');
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [files] = useState<FileItem[]>(INITIAL_FILES);

  const [mediaOptions, setMediaOptions] = useState<MediaOptions>({
    model: 'gpt-image',
    aspectRatio: '1:1',
    resolution: '2K',
    type: 'image',
  });

  /* Right sidebar mode: FoodFrame if active agent is foodframe */
  const rightSidebarMode: RightSidebarMode =
    activeAgentId === 'foodframe' ? 'foodframe' : 'tools';

  const setActiveAgentId = useCallback((id: AgentId) => {
    setActiveAgentIdState(id);
    setActiveOverlay(null);
  }, []);

  const openOverlay = useCallback((type: OverlayType) => {
    setActiveOverlay(type);
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const contextValue: AppContextValue = {
    activeAgentId,
    setActiveAgentId,
    activeOverlay,
    openOverlay,
    closeOverlay,
    rightSidebarMode,
    mediaOptions,
    setMediaOptions,
    todos,
    setTodos,
    files,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {/* Full-height 3-column grid */}
      <div
        className="flex h-screen w-screen overflow-hidden"
        style={{ background: 'var(--bg-root)' }}
      >
        {/* ── Col 1: Left Sidebar — Agents Navigation ── */}
        <LeftSidebar />

        {/* ── Col 2: Center — Chat / Canvas ── */}
        <main
          className="flex-1 min-w-0 flex flex-col overflow-hidden"
          style={{ borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}
        >
          {children}
        </main>

        {/* ── Col 3: Right Sidebar — conditional ── */}
        {rightSidebarMode === 'foodframe' ? (
          <RightSidebarFoodFrame />
        ) : (
          <RightSidebarTools />
        )}
      </div>

      {/* ── Overlay Layer ── */}
      {activeOverlay && (
        <ToolOverlayShell
          type={activeOverlay}
          onClose={closeOverlay}
        />
      )}
    </AppContext.Provider>
  );
}
