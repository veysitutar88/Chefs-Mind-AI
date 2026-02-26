'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — FilesOverlay
   ========================================================= */

import React, { useState } from 'react';
import { useApp } from '@/components/layout/AppLayout';

interface FilesOverlayProps { onClose: () => void; }

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', image: '🖼️', spreadsheet: '📊', doc: '📝', video: '🎬', other: '📎',
};

export function FilesOverlay({ onClose: _ }: FilesOverlayProps) {
  const { files } = useApp();
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchQ, setSearchQ] = useState('');

  const filtered = searchQ.trim()
    ? files.filter(f => f.name.toLowerCase().includes(searchQ.toLowerCase()))
    : files;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-soft)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search files…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          {(['list', 'grid'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-2 text-xs transition-colors"
              style={{
                background: view === v ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.04)',
                color: view === v ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {v === 'list' ? '☰' : '⊞'}
            </button>
          ))}
        </div>

        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{ background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)', boxShadow: '0 0 16px var(--accent-glow)' }}
        >
          <span>+ Upload</span>
        </button>
      </div>

      {/* File list / grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'list' ? (
          <div className="space-y-1">
            {filtered.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl group cursor-pointer relative"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid transparent' }}
              >
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', pointerEvents: 'none', borderRadius: 12 }}
                />
                <span className="text-lg flex-shrink-0 relative z-10">{FILE_ICONS[file.type] || FILE_ICONS.other}</span>
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>
                    {file.date}{file.size ? ` · ${file.size}` : ''}
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10 px-3 py-1.5 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                  Open
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map(file => (
              <div
                key={file.id}
                className="p-4 rounded-xl cursor-pointer group relative"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
              >
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
                />
                <div className="text-3xl mb-3 relative z-10">{FILE_ICONS[file.type] || FILE_ICONS.other}</div>
                <div className="text-xs font-medium truncate relative z-10" style={{ color: 'var(--text-primary)' }}>{file.name}</div>
                <div className="text-xs relative z-10" style={{ color: 'var(--text-disabled)' }}>{file.date}</div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-disabled)' }}>
            No files found
          </div>
        )}
      </div>
    </div>
  );
}
