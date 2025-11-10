'use client';

import React from 'react';

type Status = 'calling' | 'ok' | 'timeout' | 'fallback' | 'error';

interface StatusIndicatorProps {
  status: Status;
  model?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Эстетика Fine Dining:
 * - Тёплые оттенки золота/бордо для позитивных состояний
 * - Акуратная типографика и деликатные бордеры
 * - Компактный режим для встраивания в заголовки/панели
 */
export default function StatusIndicator({
  status,
  model,
  className,
  compact = false,
}: StatusIndicatorProps) {
  const palette: Record<
    Status,
    { bg: string; dot: string; text: string; label: string }
  > = {
    calling: {
      bg: 'bg-amber-50 border-amber-200',
      dot: 'bg-amber-500',
      text: 'text-amber-800',
      label: 'Запрос к модели',
    },
    ok: {
      bg: 'bg-emerald-50 border-emerald-200',
      dot: 'bg-emerald-500',
      text: 'text-emerald-800',
      label: 'Успешно',
    },
    timeout: {
      bg: 'bg-yellow-50 border-yellow-200',
      dot: 'bg-yellow-500',
      text: 'text-yellow-800',
      label: 'Таймаут',
    },
    fallback: {
      bg: 'bg-indigo-50 border-indigo-200',
      dot: 'bg-indigo-500',
      text: 'text-indigo-800',
      label: 'Фолбэк',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200',
      dot: 'bg-rose-500',
      text: 'text-rose-800',
      label: 'Ошибка',
    },
  };

  const tone = palette[status];
  const base =
    'inline-flex items-center gap-2 rounded-md border px-3 py-2 ' +
    'shadow-sm backdrop-blur-sm transition-colors';
  const small =
    'inline-flex items-center gap-1 rounded border px-2 py-1 text-xs';
  const cls = [compact ? small : base, tone.bg, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} role="status" aria-live="polite">
      <span
        className={[
          'inline-block h-2 w-2 rounded-full',
          tone.dot,
          'shadow-[0_0_0_2px_rgba(255,255,255,0.6)]',
        ].join(' ')}
      />
      <span
        className={[
          'font-medium',
          compact ? 'text-[11px]' : 'text-sm',
          tone.text,
        ].join(' ')}
      >
        {tone.label}
      </span>
      {model && (
        <span className="ml-1 rounded-full border border-black/5 bg-white/60 px-2 py-0.5 text-[11px] text-gray-700">
          {model}
        </span>
      )}
    </div>
  );
}
