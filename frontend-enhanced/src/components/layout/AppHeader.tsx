'use client';

import React from 'react';
import { AGENT_CANON } from '@/config/agents';

interface AppHeaderProps {
  currentAgent?: string;
}

export function AppHeader({ currentAgent }: AppHeaderProps) {
  const agent = currentAgent ? (Object.values(AGENT_CANON).find(a => a.id === currentAgent) || null) : null;
  const displayName = agent ? agent.label : '';

  return (
    <header className="h-0 overflow-hidden pointer-events-none">
      {/* Header Cleared for Design A - Content moved to Sidebar */}
    </header>
  );
}
