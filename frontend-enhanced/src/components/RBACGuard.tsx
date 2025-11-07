'use client';

import React from 'react';

interface RBACGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RBACGuard(props: RBACGuardProps) {
  const { allowedRoles, children } = props;

  // Читаем роль из localStorage, по умолчанию 'guest'
  const currentRole =
    typeof window !== 'undefined'
      ? localStorage.getItem('role') || 'guest'
      : 'guest';

  // Проверяем, есть ли текущая роль в списке разрешенных
  const hasAccess = allowedRoles.includes(currentRole);

  // Если нет доступа, возвращаем компактный плейсхолдер
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Доступ ограничен. Требуется роль: {allowedRoles.join(', ')}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Текущая роль: {currentRole}
          </p>
        </div>
      </div>
    );
  }

  // Если доступ разрешен, рендерим детей
  return <>{children}</>;
}
