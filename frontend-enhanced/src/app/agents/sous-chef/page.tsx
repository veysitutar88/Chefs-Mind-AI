'use client';

import { AppLayout } from '../../../components/layout/AppLayout';
import { ChatInterface } from '../../../components/chat/ChatInterface';

export default function SousChefPage() {
  return (
    <AppLayout currentAgent="sous-chef">
      <ChatInterface
        initialAgentId="chef"
        title="AI Sous-Chef"
      />
    </AppLayout>
 );
}
