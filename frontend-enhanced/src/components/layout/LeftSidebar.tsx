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
    <aside className="h-full flex flex-col bg-surface/50 border-r border-borderSoft/50 backdrop-blur-sm p-4 gap-6 min-w-[320px]">

      {/* Header: Logo */}
      <div className="flex items-center justify-center py-2">
        <Link href="/">
          <Logo className="opacity-90 hover:opacity-100 transition-opacity" size="medium" />
        </Link>
      </div>

      {/* Universal Chat Link */}
      <div className="px-1">
        <Link
          href="/"
          className={`
                        w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group
                        border 
                        ${pathname === '/'
              ? 'background-surface border-accent/30 background-glow-active scale-[1.02]'
              : 'background-surface/50 border-transparent hover:border-white/10 background-surface hover:shadow-premium hover:scale-[1.02]'
            }
                    `}
        >
          <div className={`
                        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                        ${pathname === '/' ? 'background-accent/20 text-accent' : 'background-white/5 text-textSecondary group-hover:text-textPrimary group-hover:background-white/10'}
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

      <div className="mx-2 border-t border-borderSoft/30" />

      {/* Body: Agent List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {AGENTS.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={activeAgentId === agent.id}
            onClick={(id) => router.push(`/agents/${id}`)}
          />
        ))}
      </div>

      {/* Footer: User Profile & Settings */}
      <div className="mt-auto pt-4 border-t border-borderSoft/50 space-y-4">

        {/* Model Status Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowModelInfo(!showModelInfo)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 border border-white/5 hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-accent/20 text-accent">
                <Sparkles size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-textSecondary font-semibold">Model</span>
                <span className="text-xs text-textPrimary font-medium">Gemini 3 Pro</span>
              </div>
            </div>
          </button>
          {showModelInfo && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-surface border border-borderSoft p-3 rounded-lg shadow-xl z-50 text-xs text-textSecondary animate-in fade-in slide-in-from-bottom-2">
              <p className="mb-1 text-textPrimary font-medium">Auto-Switching</p>
              LLM model routing is managed by the orchestrator.
            </div>
          )}
        </div>

        {/* User Profile Row */}
        <div className="flex items-center gap-3 px-1 relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accentSoft flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-background">
            CM
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-textPrimary truncate">Chef Admin</div>
            <div className="text-[10px] text-textSecondary truncate">admin@chefsmind.ai</div>
          </div>
          <Link
            href="/settings"
            className={`p-2 rounded-lg transition-colors ${pathname === '/settings' ? 'text-accent bg-accent/10' : 'text-textSecondary hover:text-textPrimary hover:bg-white/5'}`}
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
