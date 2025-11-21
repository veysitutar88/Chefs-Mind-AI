'use client';

import { AppLayout } from '../components/layout/AppLayout';
import { ChatInterface } from '../components/chat/ChatInterface';

export default function HomePage() {
  return (
    <AppLayout currentAgent="universal">
      <ChatInterface
        initialAgentId={null}
        title="Universal Chat"
      />
    </AppLayout>
 );
}
