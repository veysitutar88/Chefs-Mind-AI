'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — SettingsOverlay
   PLACEHOLDER — Not yet implemented (Canon 2.5 Block E)
   Sidebar visible but disabled when this overlay is open
   ========================================================= */

import React from 'react';

interface SettingsOverlayProps { onClose: () => void; }

const SETTINGS_NAV = [
  { id: 'language',         label: 'Language',          icon: '🌐' },
  { id: 'text-models',      label: 'Global Text Models', icon: '🤖' },
  { id: 'chat-behavior',    label: 'Chat Behavior',      icon: '💬' },
  { id: 'agent-settings',   label: 'Agent Settings',     icon: '⚙️' },
  { id: 'files-media',      label: 'Files & Media',      icon: '📁' },
  { id: 'about',            label: 'About',              icon: 'ℹ️' },
];

export function SettingsOverlay({ onClose: _ }: SettingsOverlayProps) {
  const [activeSection] = React.useState('language');

  return (
    <div className="flex h-full">
      {/* Left nav */}
      <div
        className="w-48 flex-shrink-0 py-4 overflow-y-auto"
        style={{ borderRight: '1px solid var(--border-subtle)' }}
      >
        <div className="px-4 mb-3">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
            Settings
          </span>
        </div>
        {SETTINGS_NAV.map(item => (
          <button
            key={item.id}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group relative"
            style={{
              background: activeSection === item.id ? 'var(--bg-active)' : 'transparent',
              borderLeft: `2px solid ${activeSection === item.id ? 'var(--accent)' : 'transparent'}`,
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
            />
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span
              className="text-sm relative z-10"
              style={{ color: activeSection === item.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
        <div
          className="agent-icon agent-icon--lg mb-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-soft)', fontSize: 28 }}
        >
          ⚙️
        </div>
        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings Coming Soon
        </h3>
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Settings panel is currently in development. Agent configuration, model selection, and language options will be available here.
        </p>
        <div
          className="mt-6 px-4 py-2 rounded-full text-xs font-medium"
          style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)', color: 'var(--accent)' }}
        >
          UICanon v2.5 · Block E — Not yet implemented
        </div>
      </div>
    </div>
  );
}
