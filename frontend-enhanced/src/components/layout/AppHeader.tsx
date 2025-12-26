'use client';

import React from 'react';
import { AGENT_CANON } from '@/config/agents';

interface AppHeaderProps {
  currentAgent?: string;
}

export function AppHeader({ currentAgent }: AppHeaderProps) {
  const agent = currentAgent ? (Object.values(AGENT_CANON).find(a => a.id === currentAgent) || null) : null;
  const displayName = agent ? agent.label : '';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="text-2xl">🧠</div>
        <h1 className="text-xl font-semibold text-cyan-500">
          Chef's Mind AI
        </h1>
      </div>

      {/* Current Agent Context */}
      {displayName && (
        <div className="text-slate-400 text-sm font-medium">
          {displayName}
        </div>
      )}

      {/* User Menu */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-semibold">
            A
          </div>
          <div className="text-sm">
            <div className="font-medium">Admin</div>
            <div className="text-xs text-slate-400">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
