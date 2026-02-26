'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface RBACGuardProps {
  allowedRoles?: string[];
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function RBACGuard(props: RBACGuardProps) {
  const { allowedRoles, children, requireAdmin = false } = props;

  // In development: bypass guard entirely — render children directly
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  // Production path below
  return (
    <RBACGuardProduction allowedRoles={allowedRoles} requireAdmin={requireAdmin}>
      {children}
    </RBACGuardProduction>
  );
}

function RBACGuardProduction({
  allowedRoles,
  children,
  requireAdmin = false,
}: RBACGuardProps) {
  const [currentRole, setCurrentRole] = useState<'guest' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isE2E =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('e2e') === '1';

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    if (isE2E) {
      const role =
        (localStorage.getItem('rbacRole') as 'admin' | 'guest') || 'guest';
      setCurrentRole(role);
    } else {
      // In production without e2e flag, read from localStorage if available
      const stored = localStorage.getItem('rbacRole') as 'admin' | 'guest' | null;
      setCurrentRole(stored);
    }

    setIsLoading(false);
  }, [isE2E]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div style={{ color: 'var(--text-secondary, #94a3b8)' }}>
          Checking access...
        </div>
      </div>
    );
  }

  // No role set in production — show styled login prompt
  if (currentRole === null) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh] p-8"
        style={{ color: 'var(--text-primary, #f8fafc)' }}
      >
        <div className="text-center space-y-4 max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'var(--bg-surface, #1e293b)' }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--accent, #0EA5E9)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Please log in</h2>
          <p style={{ color: 'var(--text-secondary, #94a3b8)' }} className="text-sm">
            You need to be signed in to access this page.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--accent, #0EA5E9)',
              color: '#fff',
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Role is set — check permissions
  const hasAccess = requireAdmin
    ? currentRole === 'admin'
    : allowedRoles?.includes(currentRole) ?? false;

  if (!hasAccess) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh] p-8"
        style={{ color: 'var(--text-primary, #f8fafc)' }}
      >
        <div className="text-center space-y-4 max-w-sm">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'var(--bg-surface, #1e293b)', color: '#f87171' }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Access restricted</h2>
          <p style={{ color: 'var(--text-secondary, #94a3b8)' }} className="text-sm">
            You don&apos;t have permission to view this page.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--accent, #0EA5E9)',
              color: '#fff',
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
