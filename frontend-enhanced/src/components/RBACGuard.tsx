'use client';

import React, { useEffect, useState } from 'react';

interface RBACGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function RBACGuard(props: RBACGuardProps) {
  const { allowedRoles, children, requireAdmin = false } = props;

  // В prod используем реальную авторизацию
  const isProd =
    typeof window !== 'undefined' && process.env.NODE_ENV === 'production';

  // Определяем, должны ли мы использовать dev/e2e режим
  const isDevOrE2E =
    !isProd ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('e2e') === '1');

  const [currentRole, setCurrentRole] = useState<'guest' | 'admin'>('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    if (isDevOrE2E) {
      // В dev/e2e режиме читаем из localStorage ключ rbacRole
      const role =
        (localStorage.getItem('rbacRole') as 'admin' | 'guest') || 'guest';
      setCurrentRole(role);
    }
    setIsLoading(false);
  }, [isDevOrE2E]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Проверка доступа...</div>
      </div>
    );
  }

  // В prod без e2e=1 полагаемся на реальную авторизацию
  // Для упрощения в рамках задачи считаем, что без dev/e2e режима доступ запрещен
  if (!isDevOrE2E) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
        <div className="text-center">
          <p className="text-red-600 text-sm">
            Доступ запрещен. Требуется авторизация.
          </p>
        </div>
      </div>
    );
  }

  // В dev/e2e режиме проверяем localStorage rbacRole
  const hasAccess = requireAdmin
    ? currentRole === 'admin'
    : allowedRoles.includes(currentRole);

  // Если нет доступа, возвращаем компактный плейсхолдер
  if (!hasAccess) {
    const message =
      process.env.NODE_ENV !== 'production' ||
      new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : ''
      ).get('e2e') === '1'
        ? `Access denied. Required: ${requireAdmin ? 'admin' : allowedRoles.join(', ')}. Current: ${currentRole}`
        : 'Доступ ограничен';

    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  // Если доступ разрешен, рендерим детей
  return <>{children}</>;
}
