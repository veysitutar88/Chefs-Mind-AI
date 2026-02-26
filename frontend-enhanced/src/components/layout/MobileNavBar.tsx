'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChefHat, BarChart2, Brain, Camera } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchSegment?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home size={22} strokeWidth={2} />,
  },
  {
    href: '/agents/souschef',
    label: 'SousChef',
    icon: <ChefHat size={22} strokeWidth={2} />,
    matchSegment: 'souschef',
  },
  {
    href: '/agents/gastrocount',
    label: 'GastroCount',
    icon: <BarChart2 size={22} strokeWidth={2} />,
    matchSegment: 'gastrocount',
  },
  {
    href: '/agents/gastromind',
    label: 'GastroMind',
    icon: <Brain size={22} strokeWidth={2} />,
    matchSegment: 'gastromind',
  },
  {
    href: '/agents/foodframe',
    label: 'FoodFrame',
    icon: <Camera size={22} strokeWidth={2} />,
    matchSegment: 'foodframe',
  },
];

export function MobileNavBar() {
  const pathname = usePathname();

  const isActive = (item: NavItem): boolean => {
    if (item.matchSegment) {
      return pathname.includes(item.matchSegment);
    }
    return pathname === '/';
  };

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        height: 64,
        background: 'var(--bg-surface, #1e293b)',
        borderTop: '1px solid var(--border, #334155)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{
              color: active
                ? 'var(--accent, #0EA5E9)'
                : 'var(--text-secondary, #64748b)',
            }}
            aria-label={item.label}
          >
            <span
              className="transition-colors"
              style={{
                color: active
                  ? 'var(--accent, #0EA5E9)'
                  : 'var(--text-secondary, #64748b)',
              }}
            >
              {item.icon}
            </span>
            <span
              className="text-[10px] font-medium leading-tight truncate max-w-[56px] text-center"
              style={{
                color: active
                  ? 'var(--accent, #0EA5E9)'
                  : 'var(--text-secondary, #64748b)',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
