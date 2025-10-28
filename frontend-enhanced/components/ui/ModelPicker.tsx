'use client';

import React, { useEffect, useState } from 'react';

type ModelOption = { id: string; name: string; provider: 'openai' | 'google' | 'perplexity' };

interface ModelPickerProps {
  value?: string;
  onChange: (modelId: string) => void;
  className?: string;
  includeAuto?: boolean;
}

const FALLBACK_MODELS: ModelOption[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google' },
  { id: 'sonar', name: 'Perplexity Sonar', provider: 'perplexity' },
];

export default function ModelPicker({ value, onChange, className, includeAuto = true }: ModelPickerProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/models', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          if (alive) setModels(data as ModelOption[]);
        } else {
          throw new Error('Empty models list');
        }
      } catch (e: any) {
        if (alive) {
          setError('Не удалось загрузить список моделей, использую фолбэк');
          setModels(FALLBACK_MODELS);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const selected = value ?? (includeAuto ? 'auto' : (models[0]?.id ?? ''));

  return (
    <div className={["flex flex-col gap-1", className].filter(Boolean).join(' ')}>
      <label className="text-sm font-medium text-gray-700">Модель</label>
      <div className="relative">
        <select
          className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          aria-label="Выбор модели ИИ"
        >
          {includeAuto && <option value="auto">Auto</option>}
          {models.map(m => (
            <option key={m.id} value={m.id}>{m.name} · {m.provider}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">▾</div>
      </div>
      {loading && <span className="text-xs text-gray-500">Загрузка моделей...</span>}
      {error && <span className="text-xs text-amber-600">{error}</span>}
    </div>
  );
}