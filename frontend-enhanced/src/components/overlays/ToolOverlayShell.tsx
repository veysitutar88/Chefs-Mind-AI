'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — ToolOverlayShell
   Center modal container for all overlays
   Canon rules: Esc + backdrop click = close, only one at a time
   ========================================================= */

import React, { useEffect, useCallback } from 'react';
import { OverlayType } from '@/types/ui';
import { CalendarOverlay } from './CalendarOverlay';
import { NoteTasksOverlay } from './NoteTasksOverlay';
import { SearchOverlay } from './SearchOverlay';
import { RecentChatsOverlay } from './RecentChatsOverlay';
import { FilesOverlay } from './FilesOverlay';
import { PresetLibraryOverlay } from './PresetLibraryOverlay';
import { SettingsOverlay } from './SettingsOverlay';

/* ---------------------------------------------------------
   Overlay size map
--------------------------------------------------------- */
const OVERLAY_SIZES: Record<NonNullable<OverlayType>, { width: string | number; height: string | number }> = {
  calendar:      { width: 720, height: 560 },
  'notes-tasks': { width: 580, height: 520 },
  search:        { width: 600, height: 420 },
  'recent-chats':{ width: 640, height: 500 },
  files:         { width: 660, height: 540 },
  'preset-library': { width: 760, height: 560 },
  settings:      { width: 820, height: 600 },
};

const OVERLAY_TITLES: Record<NonNullable<OverlayType>, string> = {
  calendar:      'Calendar',
  'notes-tasks': 'Notes & Tasks',
  search:        'Search',
  'recent-chats':'Recent Chats',
  files:         'Files',
  'preset-library': 'Preset Library',
  settings:      'Settings',
};

/* ---------------------------------------------------------
   ToolOverlayShell
--------------------------------------------------------- */
interface ToolOverlayShellProps {
  type: NonNullable<OverlayType>;
  onClose: () => void;
}

export function ToolOverlayShell({ type, onClose }: ToolOverlayShellProps) {
  const size = OVERLAY_SIZES[type] || { width: 680, height: 520 };
  const title = OVERLAY_TITLES[type] || '';

  /* Close on Escape */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* Trap body scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    /* Backdrop */
    <div
      className="overlay-backdrop animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Panel — stop propagation so clicking inside doesn't close */}
      <div
        className="overlay-panel animate-scale-in flex flex-col"
        style={{ width: size.width, maxWidth: 'calc(100vw - 48px)', height: size.height, maxHeight: 'calc(100vh - 48px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-xl transition-colors"
            style={{
              width: 32,
              height: 32,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden">
          <OverlayContent type={type} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Route to correct overlay content
--------------------------------------------------------- */
function OverlayContent({ type, onClose }: { type: NonNullable<OverlayType>; onClose: () => void }) {
  switch (type) {
    case 'calendar':       return <CalendarOverlay onClose={onClose} />;
    case 'notes-tasks':    return <NoteTasksOverlay onClose={onClose} />;
    case 'search':         return <SearchOverlay onClose={onClose} />;
    case 'recent-chats':   return <RecentChatsOverlay onClose={onClose} />;
    case 'files':          return <FilesOverlay onClose={onClose} />;
    case 'preset-library': return <PresetLibraryOverlay onClose={onClose} />;
    case 'settings':       return <SettingsOverlay onClose={onClose} />;
    default:               return null;
  }
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
