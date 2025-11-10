'use client';

import React from 'react';

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

/**
 * SkeletonLoader — лёгкий плейсхолдер под Fine Dining эстетику.
 * Мягкие бордеры и приглушённая анимация.
 */
export default function SkeletonLoader({ lines = 1, className }: SkeletonLoaderProps) {
  const items = Array.from({ length: Math.max(1, lines) });

  return (
    <div className={['animate-pulse space-y-2', className].filter(Boolean).join(' ')}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="h-4 w-full rounded-md bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50"
          style={{ opacity: 0.75 }}
        />
      ))}
    </div>
  );
}