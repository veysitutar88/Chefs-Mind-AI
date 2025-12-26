'use client';

import { AppLayout } from '../../../components/layout/AppLayout';
import { ChatInterface } from '../../../components/chat/ChatInterface';
import { AGENT_CANON } from '@/config/agents';

export default function SousChefPage() {
  const agent = AGENT_CANON.souschef;

  return (
    <AppLayout currentAgent={agent.id}>
      <ChatInterface
        initialAgentId={agent.id}
        title={agent.label}
      />
    </AppLayout>
  );
}
