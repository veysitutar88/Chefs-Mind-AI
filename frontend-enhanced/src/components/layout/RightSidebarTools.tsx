'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — RightSidebarTools
   Standard Tools sidebar (non-FoodFrame agents)
   Contains: Tools quick-actions + Notes/Tasks widget + Files widget
   ========================================================= */

import React, { useState } from 'react';
import { useApp } from './AppLayout';
import { TOOLS } from '@/constants/ui';
import { ToolAction, TodoItem } from '@/types/ui';

/* ---------------------------------------------------------
   RightSidebarTools
--------------------------------------------------------- */
export function RightSidebarTools() {
  const { openOverlay, todos, setTodos, files, activeAgentId } = useApp();

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 64, borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tools</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {activeAgentId === 'souschef' ? 'SousChef' :
           activeAgentId === 'gastrocount' ? 'GastroCount' :
           activeAgentId === 'gastromind' ? 'GastroMind' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Quick Tool Actions ── */}
        <div className="p-4 space-y-2">
          <div className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
            Open
          </div>
          {TOOLS.map((tool) => (
            <ToolButton
              key={tool.id}
              id={tool.id}
              label={tool.label}
              icon={tool.icon}
              shortcut={tool.shortcut}
              onClick={() => openOverlay(tool.id as ToolAction)}
            />
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />

        {/* ── Notes & Tasks Widget ── */}
        <NotesTasksWidget todos={todos} setTodos={setTodos} />

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 16px' }} />

        {/* ── Recent Files Widget ── */}
        <FilesWidget files={files} onOpenAll={() => openOverlay('files')} />
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------
   ToolButton
--------------------------------------------------------- */
interface ToolButtonProps {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  onClick: () => void;
}

function ToolButton({ label, icon, shortcut, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-all duration-150 relative"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="agent-icon agent-icon--sm flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.08)', fontSize: 14 }}
      >
        {icon}
      </div>
      <span className="flex-1 text-sm text-left" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      {shortcut && (
        <kbd
          className="text-xs px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-disabled)',
            fontFamily: 'inherit',
          }}
        >
          {shortcut}
        </kbd>
      )}
      {/* Hover overlay */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
      />
    </button>
  );
}

/* ---------------------------------------------------------
   Notes & Tasks Widget (inline, not overlay)
--------------------------------------------------------- */
interface NotesTasksWidgetProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

function NotesTasksWidget({ todos, setTodos }: NotesTasksWidgetProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    setTodos(prev => [{ id: String(Date.now()), text, completed: false }, ...prev]);
    setInputValue('');
  };

  const handleToggle = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
          Tasks
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {todos.filter(t => !t.completed).length} remaining
        </span>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add task…"
          className="flex-1 input-canon text-xs"
          style={{ height: 32, padding: '0 10px', borderRadius: 10 }}
        />
        <button
          onClick={handleAdd}
          className="flex-shrink-0 flex items-center justify-center rounded-xl transition-colors"
          style={{
            width: 32,
            height: 32,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 300,
          }}
        >
          +
        </button>
      </div>

      {/* Todo list */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {todos.slice(0, 8).map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg group"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <button
              onClick={() => handleToggle(todo.id)}
              className="flex-shrink-0 transition-all"
              style={{
                width: 16,
                height: 16,
                borderRadius: 9999,
                border: `1.5px solid ${todo.completed ? 'var(--accent)' : 'var(--border-strong)'}`,
                background: todo.completed ? 'var(--accent)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {todo.completed && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span
              className="flex-1 text-xs truncate"
              style={{
                color: todo.completed ? 'var(--text-disabled)' : 'var(--text-muted)',
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: 'var(--text-disabled)', lineHeight: 1 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Files Widget
--------------------------------------------------------- */
interface FilesWidgetProps {
  files: { id: string; name: string; type: string; date: string }[];
  onOpenAll: () => void;
}

function FilesWidget({ files, onOpenAll }: FilesWidgetProps) {
  const fileIcons: Record<string, string> = {
    pdf: '📄', image: '🖼️', spreadsheet: '📊', doc: '📝', other: '📎',
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
          Recent Files
        </span>
        <button
          onClick={onOpenAll}
          className="text-xs transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          All files →
        </button>
      </div>

      <div className="space-y-1">
        {files.slice(0, 4).map(file => (
          <div
            key={file.id}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg group cursor-pointer transition-colors"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>
              {fileIcons[file.type] || fileIcons.other}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{file.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>{file.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
