'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — NoteTasksOverlay
   ========================================================= */

import React, { useState } from 'react';
import { useApp } from '@/components/layout/AppLayout';

interface NoteTasksOverlayProps { onClose: () => void; }

export function NoteTasksOverlay({ onClose: _ }: NoteTasksOverlayProps) {
  const { todos, setTodos } = useApp();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [inputValue, setInputValue] = useState('');
  const [noteText, setNoteText] = useState('');

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    setTodos(prev => [{ id: String(Date.now()), text, completed: false }, ...prev]);
    setInputValue('');
  };

  const handleToggle = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const handleDelete = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
        {(['tasks', 'notes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? 'var(--accent-subtle)' : 'transparent',
              border: `1px solid ${activeTab === tab ? 'var(--border-accent)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'tasks' ? (
          <>
            {/* Add task */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Add a task…"
                className="flex-1 input-canon"
                style={{ height: 40 }}
              />
              <button
                onClick={handleAdd}
                className="px-4 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', height: 40, boxShadow: '0 0 16px var(--accent-glow)' }}
              >
                Add
              </button>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
                >
                  <button
                    onClick={() => handleToggle(todo.id)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9999,
                      border: `1.5px solid ${todo.completed ? 'var(--accent)' : 'var(--border-strong)'}`,
                      background: todo.completed ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 150ms ease',
                    }}
                  >
                    {todo.completed && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M1.5 4.5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{ color: todo.completed ? 'var(--text-disabled)' : 'var(--text-muted)', textDecoration: todo.completed ? 'line-through' : 'none' }}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="text-center py-8 text-sm" style={{ color: 'var(--text-disabled)' }}>
                  No tasks yet. Add one above!
                </div>
              )}
            </div>
          </>
        ) : (
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Start typing your notes…"
            className="w-full h-64 input-canon resize-none text-sm leading-relaxed"
            style={{ borderRadius: 16, padding: 16 }}
          />
        )}
      </div>
    </div>
  );
}
