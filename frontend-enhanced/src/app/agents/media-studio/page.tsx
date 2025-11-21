'use client';

import { AppLayout } from '../../../components/layout/AppLayout';
import { ChatInterface } from '../../../components/chat/ChatInterface';

export default function MediaStudioPage() {
  return (
    <AppLayout currentAgent="media-studio">
      <ChatInterface
        initialAgentId="media"
        title="AI Media-Studio"
      />
    </AppLayout>
 );
}
