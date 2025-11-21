'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AgentItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  color: string;
  description: string;
}

const agents: AgentItem[] = [
  {
    id: 'sous-chef',
    name: 'AI Sous-Chef',
    icon: '👨‍🍳',
    href: '/agents/sous-chef',
    color: 'text-orange-500',
    description: 'Kitchen & Recipes',
  },
  {
    id: 'brain-chef',
    name: 'AI Brain-Chef',
    icon: '🧮',
    href: '/agents/brain-chef',
    color: 'text-green-500',
    description: 'Finance & Costs',
  },
  {
    id: 'research',
    name: 'AI Research',
    icon: '🔍',
    href: '/agents/research',
    color: 'text-purple-500',
    description: 'Market Research',
  },
  {
    id: 'media-studio',
    name: 'AI Media-Studio',
    icon: '🎨',
    href: '/agents/media-studio',
    color: 'text-pink-500',
    description: 'Images & Videos',
  },
];

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </Link>
      </div>

      {/* Universal Chat */}
      <div className="px-4 pb-2">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span className="text-xl">💬</span>
          <span className="font-medium">Universal Chat</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-800 my-2"></div>

      {/* Agent List */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {agents.map((agent) => {
          const isActive = pathname === agent.href;
          return (
            <Link
              key={agent.id}
              href={agent.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{agent.name}</div>
                <div className={`text-xs truncate ${
                  isActive ? 'text-cyan-100' : 'text-slate-500 group-hover:text-slate-400'
                }`}>
                  {agent.description}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                isActive ? 'bg-white' : 'bg-green-500'
              }`}></div>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-800 my-2"></div>

      {/* Settings */}
      <div className="p-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/settings'
              ? 'bg-cyan-500 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span className="text-xl">⚙️</span>
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
