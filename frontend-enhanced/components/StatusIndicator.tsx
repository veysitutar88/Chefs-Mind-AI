import React from 'react';

interface StatusIndicatorProps {
  status: 'calling' | 'ok' | 'timeout' | 'fallback' | 'error';
  model?: string;
}

export default function StatusIndicator({ status, model }: StatusIndicatorProps) {
  return (
    <div className="status-indicator">
      <div>Status: {status}</div>
      <div>Model: {model}</div>
    </div>
  );
}

// Добавлю команду сборки TypeScript в Dockerfile. Сначала проверю текущую структуру Dockerfile: ... ... 