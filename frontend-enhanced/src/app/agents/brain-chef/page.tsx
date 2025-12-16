'use client';

import { AppLayout } from '../../../components/layout/AppLayout';
import { ChatInterface } from '../../../components/chat/ChatInterface';

export default function BrainChefPage() {
  return (
    <AppLayout currentAgent="brain-chef">
      <ChatInterface
        initialAgentId="accountant"
        title="AI Brain-Chef"
      />
    </AppLayout>
 );
}
