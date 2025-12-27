'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { AgentCard } from '../ui/AgentCard';
import { AGENTS } from '@/constants/ui';
import { AgentId } from '@/types/ui';
import { Settings, Sparkles, MessageSquare } from 'lucide-react';

export function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showModelInfo, setShowModelInfo] = React.useState(false);

  // Derived active agent ID from pathname
  const activeAgentId = AGENTS.find(a => pathname.includes(a.id))?.id || (pathname === '/' ? null : null);

  return (
    <aside className="h-full flex flex-col p-4 gap-4 min-w-[320px]">

      {/* 1. Static Header / Logo Placeholder (Non-interactive) - Fixed Height */}
      <div
        className="flex-shrink-0 flex items-center justify-center pointer-events-none select-none h-20 w-full"
        aria-hidden="true"
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-2xl border border-white/5 opacity-80">
          <Logo size="medium" className="pointer-events-none" />
        </div>
      </div>

      {/* 2. Universal Chat Link - Fixed Item */}
      <div className="px-1 flex-shrink-0">
        <Link
          href="/"
          className={`
                        w-[calc(100%-1rem)] mx-auto flex items-center gap-4 py-3 px-3 rounded-[2rem] transition-all duration-300 text-left group
                        relative overflow-visible
                        ${pathname === '/'
              ? 'bg-gradient-to-r from-accent/20 via-accent/5 to-transparent shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]'
              : 'hover:bg-white/5 hover:shadow-lg hover:shadow-black/20'
            }
                    `}
        >
          <div className={`
                        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300
                        ${pathname === '/' ? 'bg-accent/20 text-accent shadow-[0_0_10px_-2px_rgba(56,189,248,0.4)]' : 'bg-white/5 text-textSecondary group-hover:text-white group-hover:bg-white/10'}
                    `}>
            <MessageSquare size={24} strokeWidth={pathname === '/' ? 2.5 : 2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`font-semibold text-base truncate transition-colors ${pathname === '/' ? 'text-accent' : 'text-textPrimary group-hover:text-white'}`}>
              Universal Chat
            </span>
            <span className="text-xs text-textSecondary leading-snug line-clamp-1">
              Global orchestration
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Agent List - Fixed Column (No Scroll, No Overflow Hiding) */}
      <div className="flex flex-col gap-1 py-1 px-1 flex-shrink-0">
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={activeAgentId === agent.id}
            onClick={(id) => router.push(`/agents/${id}`)}
          />
        ))}
      </div>

      {/* Footer: User Profile + Settings (Design A: Bottom Left) */}
      <div className="mt-auto pt-2 pb-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-[2rem] hover:bg-white/5 transition-colors group cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accentSoft flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-background group-hover:ring-accent/50 transition-all">
            CM
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-textPrimary truncate group-hover:text-white">Chef Admin</div>
            <div className="text-[10px] text-textSecondary truncate">admin@chefsmind.ai</div>
          </div>

          {/* Settings Access (Moved UP/Inside Footer as requested) */}
          <Link
            href="/settings"
            className="p-2 mr-1 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-all"
            aria-label="Settings"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
