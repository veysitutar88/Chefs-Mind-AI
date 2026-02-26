'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — RecentChatsOverlay
   ========================================================= */

import React, { useState } from 'react';
import { useApp } from '@/components/layout/AppLayout';
import { AgentId } from '@/types/ui';

interface RecentChatsOverlayProps { onClose: () => void; }

const AGENT_ICONS: Record<AgentId, string> = {
  souschef: '👨‍🍳', gastrocount: '🧮', gastromind: '🔍', foodframe: '🎨',
};

const MOCK_CHATS = [
  { id: '1', agentId: 'souschef' as AgentId,    title: 'Sea Bass Preparation',        preview: 'Use a dry brine 2 hours before...', time: '2h ago',  messages: 12 },
  { id: '2', agentId: 'gastrocount' as AgentId, title: 'August Cost Analysis',         preview: 'Food cost at 28.4%, down from...', time: '5h ago',  messages: 8 },
  { id: '3', agentId: 'gastromind' as AgentId,  title: 'Plant-Based Protein Trends',  preview: 'Jackfruit and seitan continue...',  time: '1d ago',  messages: 15 },
  { id: '4', agentId: 'souschef' as AgentId,    title: 'Weekend Prep Schedule',       preview: 'For 40 covers you will need...',   time: '1d ago',  messages: 6 },
  { id: '5', agentId: 'foodframe' as AgentId,   title: 'Menu Photography Session',    preview: 'Generated 8 hero shots for...',    time: '2d ago',  messages: 3 },
  { id: '6', agentId: 'gastrocount' as AgentId, title: 'Supplier Price Comparison',   preview: 'Truffle prices up 12% from...',    time: '3d ago',  messages: 10 },
];

export function RecentChatsOverlay({ onClose }: RecentChatsOverlayProps) {
  const { setActiveAgentId } = useApp();
  const [filter, setFilter] = useState<AgentId | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_CHATS : MOCK_CHATS.filter(c => c.agentId === filter);

  const handleOpen = (chat: typeof MOCK_CHATS[0]) => {
    setActiveAgentId(chat.agentId);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter pills */}
      <div className="flex gap-2 px-6 pt-4 pb-4 flex-shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {(['all', 'souschef', 'gastrocount', 'gastromind', 'foodframe'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
            style={{
              background: filter === f ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${filter === f ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {f !== 'all' && <span>{AGENT_ICONS[f as AgentId]}</span>}
            {f === 'all' ? 'All agents' : f === 'souschef' ? 'SousChef' : f === 'gastrocount' ? 'GastroCount' : f === 'gastromind' ? 'GastroMind' : 'FoodFrame'}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filtered.map(chat => (
            <button
              key={chat.id}
              onClick={() => handleOpen(chat)}
              className="w-full flex items-start gap-4 px-4 py-3 rounded-xl text-left group relative"
            >
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
              />
              <div
                className="agent-icon agent-icon--sm flex-shrink-0 mt-0.5 relative z-10"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <span style={{ fontSize: 13 }}>{AGENT_ICONS[chat.agentId]}</span>
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{chat.title}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-disabled)' }}>{chat.time}</span>
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{chat.preview}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>{chat.messages} messages</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
