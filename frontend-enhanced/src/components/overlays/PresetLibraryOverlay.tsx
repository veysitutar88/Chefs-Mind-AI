'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — PresetLibraryOverlay
   FoodFrame styling presets
   ========================================================= */

import React, { useState } from 'react';
import { useApp } from '@/components/layout/AppLayout';

interface PresetLibraryOverlayProps { onClose: () => void; }

const PRESETS = [
  { id: 'editorial',   label: 'Editorial',    desc: 'Magazine-quality, soft shadows',  emoji: '📷', tags: ['light', 'clean'] },
  { id: 'dark-drama',  label: 'Dark Drama',   desc: 'Moody, dark background, high contrast', emoji: '🌑', tags: ['dark', 'intense'] },
  { id: 'rustic',      label: 'Rustic Warmth',desc: 'Warm tones, wooden textures',     emoji: '🪵', tags: ['warm', 'natural'] },
  { id: 'minimal',     label: 'Minimal White', desc: 'Clean white backdrop, top-down', emoji: '⬜', tags: ['clean', 'simple'] },
  { id: 'cinematic',   label: 'Cinematic',    desc: 'Film grain, anamorphic lens flare', emoji: '🎬', tags: ['cinematic', 'premium'] },
  { id: 'social',      label: 'Social Ready', desc: 'Vibrant colors, social-optimized', emoji: '📱', tags: ['vibrant', 'social'] },
  { id: 'michelin',    label: 'Fine Dining',  desc: 'Michelin star plating aesthetics', emoji: '⭐', tags: ['premium', 'fine'] },
  { id: 'street',      label: 'Street Food',  desc: 'Urban, casual, energetic feel',   emoji: '🌮', tags: ['casual', 'vibrant'] },
];

const CATEGORIES = ['All', 'Clean', 'Dark', 'Warm', 'Premium', 'Vibrant'];

export function PresetLibraryOverlay({ onClose }: PresetLibraryOverlayProps) {
  const { mediaOptions, setMediaOptions } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? PRESETS
    : PRESETS.filter(p => p.tags.some(t => t.toLowerCase() === activeCategory.toLowerCase()));

  const handleSelect = (presetId: string) => {
    setMediaOptions(prev => ({ ...prev, preset: presetId }));
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="flex gap-2 px-6 pt-4 pb-4 flex-shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: activeCategory === cat ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${activeCategory === cat ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
              color: activeCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(preset => {
            const isSelected = mediaOptions.preset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset.id)}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition-all relative"
                style={{
                  background: isSelected ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                  boxShadow: isSelected ? '0 0 16px var(--accent-glow)' : 'none',
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{preset.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                  >
                    {preset.label}
                  </div>
                  <div className="text-xs leading-snug" style={{ color: 'var(--text-disabled)' }}>
                    {preset.desc}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="absolute top-3 right-3"
                    style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
