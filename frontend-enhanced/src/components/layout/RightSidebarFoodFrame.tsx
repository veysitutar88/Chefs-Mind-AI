'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — RightSidebarFoodFrame
   FoodFrame dedicated controls sidebar
   Blocks: StylingPreset | MediaModel | AspectRatio | Resolution | GenerateControls | MediaAccess
   ========================================================= */

import React from 'react';
import { useApp } from './AppLayout';
import { MEDIA_MODELS, ASPECT_RATIOS, OUTPUT_RESOLUTIONS } from '@/constants/ui';
import { MediaModel, AspectRatio, OutputResolution } from '@/types/ui';

/* ---------------------------------------------------------
   RightSidebarFoodFrame
--------------------------------------------------------- */
export function RightSidebarFoodFrame() {
  const { mediaOptions, setMediaOptions, openOverlay } = useApp();

  const updateOption = <K extends keyof typeof mediaOptions>(key: K, value: typeof mediaOptions[K]) => {
    setMediaOptions(prev => ({ ...prev, [key]: value }));
  };

  /* Available image models (non-reserved) */
  const imageModels = MEDIA_MODELS.filter(m => !m.reserved && m.type === 'image');
  const videoModels = MEDIA_MODELS.filter(m => !m.reserved && m.type === 'video');

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
        className="flex items-center gap-3 px-5"
        style={{ height: 64, borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}
      >
        <div
          className="agent-icon agent-icon--sm"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <span style={{ fontSize: 14 }}>🎨</span>
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>FoodFrame</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Visual Studio</div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Block: Styling Preset ── */}
        <SidebarBlock label="Styling Preset">
          <button
            onClick={() => openOverlay('preset-library')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group relative"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {mediaOptions.preset || 'No preset selected'}
            </span>
            <ChevronIcon />
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
            />
          </button>
        </SidebarBlock>

        {/* ── Block: Media Model ── */}
        <SidebarBlock label="Media Model">
          <div className="space-y-1">
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-disabled)' }}>Image</div>
            {imageModels.map(model => (
              <SelectChip
                key={model.id}
                label={model.label}
                isActive={mediaOptions.model === model.id}
                onClick={() => updateOption('model', model.id as MediaModel)}
              />
            ))}
            <div className="text-xs mt-2 mb-1.5" style={{ color: 'var(--text-disabled)' }}>Video</div>
            {videoModels.map(model => (
              <SelectChip
                key={model.id}
                label={model.label}
                isActive={mediaOptions.model === model.id}
                onClick={() => updateOption('model', model.id as MediaModel)}
              />
            ))}
            {/* Veo 3 reserved */}
            <SelectChip
              label="Veo 3"
              isActive={false}
              disabled
              badge="Soon"
              onClick={() => {}}
            />
          </div>
        </SidebarBlock>

        {/* ── Block: Aspect Ratio ── */}
        <SidebarBlock label="Aspect Ratio">
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map(ratio => (
              <button
                key={ratio}
                onClick={() => updateOption('aspectRatio', ratio as AspectRatio)}
                className="py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: mediaOptions.aspectRatio === ratio ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${mediaOptions.aspectRatio === ratio ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                  color: mediaOptions.aspectRatio === ratio ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: mediaOptions.aspectRatio === ratio ? '0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                {ratio}
              </button>
            ))}
          </div>
        </SidebarBlock>

        {/* ── Block: Output Resolution ── */}
        <SidebarBlock label="Output Resolution">
          <div className="grid grid-cols-3 gap-1.5">
            {OUTPUT_RESOLUTIONS.map(res => (
              <button
                key={res}
                onClick={() => updateOption('resolution', res as OutputResolution)}
                className="py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: mediaOptions.resolution === res ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${mediaOptions.resolution === res ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                  color: mediaOptions.resolution === res ? 'var(--accent)' : 'var(--text-muted)',
                  boxShadow: mediaOptions.resolution === res ? '0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                {res}
              </button>
            ))}
          </div>
        </SidebarBlock>

        {/* ── Block: Generate Controls ── */}
        <SidebarBlock label="Generate">
          <div className="space-y-2">
            <GenerateButton
              label="Generate Image"
              icon="🖼️"
              primary
              onClick={() => {/* Handled by chat page */}}
            />
            <GenerateButton
              label="Generate Video"
              icon="🎬"
              primary={false}
              onClick={() => {/* Handled by chat page */}}
            />
          </div>
        </SidebarBlock>

        {/* ── Block: Media Access ── */}
        <SidebarBlock label="Media Files">
          <button
            onClick={() => openOverlay('files')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group relative"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <span style={{ fontSize: 16 }}>📁</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Open Media Files</span>
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'var(--bg-hover)', pointerEvents: 'none' }}
            />
          </button>
        </SidebarBlock>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------
   Sub-components
--------------------------------------------------------- */

function SidebarBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="text-xs font-semibold uppercase mb-2"
        style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function SelectChip({
  label, isActive, onClick, disabled, badge,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all"
      style={{
        background: isActive ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isActive ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
        color: isActive ? 'var(--accent)' : disabled ? 'var(--text-disabled)' : 'var(--text-muted)',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span>{label}</span>
      {badge && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-disabled)' }}
        >
          {badge}
        </span>
      )}
      {isActive && (
        <div
          style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--accent)' }}
        />
      )}
    </button>
  );
}

function GenerateButton({
  label, icon, primary, onClick,
}: {
  label: string;
  icon: string;
  primary: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-medium text-sm transition-all"
      style={{
        background: primary ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${primary ? 'var(--accent)' : 'var(--border-soft)'}`,
        color: primary ? '#fff' : 'var(--text-muted)',
        boxShadow: primary ? '0 0 20px var(--accent-glow)' : 'none',
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-disabled)', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
