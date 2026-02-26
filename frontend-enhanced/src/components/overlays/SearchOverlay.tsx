'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — SearchOverlay
   ========================================================= */

import React, { useState, useRef, useEffect } from 'react';

interface SearchOverlayProps { onClose: () => void; }

const MOCK_RESULTS = [
  { id: '1', type: 'recipe',    title: 'Sea Bass with Citrus Beurre Blanc', agent: 'SousChef',    time: '2h ago' },
  { id: '2', type: 'report',    title: 'Weekly Cost Report — Aug Week 3',    agent: 'GastroCount', time: '1d ago' },
  { id: '3', type: 'insight',   title: 'Plant-Based Trends Q3 2025',         agent: 'GastroMind',  time: '2d ago' },
  { id: '4', type: 'image',     title: 'Truffle Risotto Hero Shot',           agent: 'FoodFrame',   time: '3h ago' },
  { id: '5', type: 'recipe',    title: 'Duck Confit with Cherry Reduction',  agent: 'SousChef',    time: '5h ago' },
];

const TYPE_ICONS: Record<string, string> = {
  recipe: '🍳', report: '📊', insight: '🔍', image: '🖼️', video: '🎬',
};

export function SearchOverlay({ onClose: _ }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim()
    ? MOCK_RESULTS.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_RESULTS;

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-6 pt-4 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search chats, recipes, reports, files…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {!query && (
          <div className="text-xs font-semibold uppercase mb-3" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em', paddingLeft: 4 }}>
            Recent
          </div>
        )}
        <div className="space-y-1">
          {results.map(result => (
            <button
              key={result.id}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left group relative transition-all"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
              />
              <span className="text-lg flex-shrink-0 relative z-10">{TYPE_ICONS[result.type] || '📄'}</span>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{result.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-disabled)' }}>{result.agent} · {result.time}</div>
              </div>
            </button>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--text-disabled)' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
