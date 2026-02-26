'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — LeftSidebar
   Agents Navigation Column
   ========================================================= */

import React from 'react';
import { useApp } from './AppLayout';
import { AGENTS } from '@/constants/ui';
import { AgentId } from '@/types/ui';

/* ---------------------------------------------------------
   Agent accent color map
--------------------------------------------------------- */
const AGENT_COLORS: Record<AgentId, { bg: string; glow: string }> = {
  souschef:    { bg: '#1e3a5f', glow: 'rgba(59,130,246,0.35)' },
  gastrocount: { bg: '#1a3a2e', glow: 'rgba(34,197,94,0.35)' },
  gastromind:  { bg: '#2d1f4e', glow: 'rgba(139,92,246,0.35)' },
  foodframe:   { bg: '#3a1f1f', glow: 'rgba(239,68,68,0.35)' },
};

/* ---------------------------------------------------------
   LeftSidebar Component
--------------------------------------------------------- */
export function LeftSidebar() {
  const { activeAgentId, setActiveAgentId, openOverlay } = useApp();

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* ── Brand Header ── */}
      <div
        className="flex items-center gap-3 px-5"
        style={{ borderBottom: '1px solid var(--border-subtle)', height: 64, flexShrink: 0 }}
      >
        <div
          className="agent-icon agent-icon--md flex-shrink-0"
          style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)' }}
        >
          <span style={{ fontSize: 18 }}>🍽️</span>
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            Chef&apos;s AI OS
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            v2.5 · Pro
          </div>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="px-5 pt-5 pb-2 flex-shrink-0">
        <span
          className="text-xs font-semibold uppercase"
          style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}
        >
          Agents
        </span>
      </div>

      {/* ── Agent Navigation ── */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {AGENTS.map((agent) => {
          const isActive = activeAgentId === agent.id;
          const colors = AGENT_COLORS[agent.id];

          return (
            <AgentButton
              key={agent.id}
              agentId={agent.id}
              label={agent.label}
              subtitle={agent.subtitle}
              icon={agent.icon}
              isActive={isActive}
              colors={colors}
              onClick={() => setActiveAgentId(agent.id)}
            />
          );
        })}
      </nav>

      {/* ── Bottom Section ── */}
      <div
        className="px-3 pb-4 pt-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        {/* Settings */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors duration-150 relative"
          onClick={() => openOverlay('settings')}
          style={{ color: 'var(--text-muted)' }}
        >
          <div
            className="agent-icon agent-icon--sm flex-shrink-0 group-hover:bg-white/10 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <SettingsIcon />
          </div>
          <span
            className="text-sm group-hover:text-white transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Settings
          </span>
        </button>

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div
            className="agent-icon agent-icon--sm flex-shrink-0"
            style={{
              background: 'var(--accent-subtle)',
              border: '1px solid var(--border-accent)',
              color: 'var(--accent)',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            C
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>Chef</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-disabled)' }}>Pro Plan</div>
          </div>
          <div className="status-dot status-dot--online" />
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------
   AgentButton
--------------------------------------------------------- */
interface AgentButtonProps {
  agentId: AgentId;
  label: string;
  subtitle: string;
  icon: string;
  isActive: boolean;
  colors: { bg: string; glow: string };
  onClick: () => void;
}

function AgentButton({ label, subtitle, icon, isActive, colors, onClick }: AgentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left relative group"
      style={{
        background: isActive ? 'var(--bg-active)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--border-accent)' : 'transparent'}`,
        boxShadow: isActive ? `0 0 18px ${colors.glow}` : 'none',
        transition: 'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
      }}
    >
      {/* Hover layer */}
      {!isActive && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
        />
      )}

      {/* Icon — rounded-full per Canon */}
      <div
        className="agent-icon agent-icon--md flex-shrink-0 relative z-10"
        style={{
          background: isActive ? colors.bg : 'rgba(255,255,255,0.06)',
          boxShadow: isActive ? `0 0 0 2px var(--accent), 0 0 14px ${colors.glow}` : 'none',
          transition: 'box-shadow 150ms ease',
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0 relative z-10">
        <div
          className="text-sm font-medium truncate transition-colors duration-150"
          style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          {label}
        </div>
        <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-disabled)' }}>
          {subtitle}
        </div>
      </div>

      {/* Active dot */}
      {isActive && (
        <div
          className="flex-shrink-0 relative z-10"
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
        />
      )}
    </button>
  );
}

/* ---------------------------------------------------------
   Icons
--------------------------------------------------------- */
function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
