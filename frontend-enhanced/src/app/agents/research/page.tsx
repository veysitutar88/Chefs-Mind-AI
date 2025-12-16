'use client';

import { AppLayout } from '../../../components/layout/AppLayout';
import { ChatInterface } from '../../../components/chat/ChatInterface';

export default function ResearchPage() {
  return (
    <AppLayout currentAgent="research">
      <ChatInterface
        initialAgentId="researcher"
        title="AI Research"
      />
    </AppLayout>
 );
}
