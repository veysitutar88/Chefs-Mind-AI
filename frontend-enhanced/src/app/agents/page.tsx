'use client';

import { RBACGuard } from '../../components/RBACGuard';

function AgentsContent() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">AI Agents</h1>
      <p className="text-muted-foreground">
        Interact with our specialized AI agents. Each agent is designed for
        specific restaurant management tasks including culinary expertise,
        financial analysis, research, media creation, and general assistance.
      </p>
    </main>
  );
}

export default function AgentsPage() {
  return (
    <RBACGuard allowedRoles={['admin']}>
      <AgentsContent />
    </RBACGuard>
  );
}
