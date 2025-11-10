'use client';

import { RBACGuard } from '../../components/RBACGuard';

function MediaContent() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Media Center</h1>
      <p className="text-muted-foreground">
        Generate and manage visual content for your restaurant. Create
        promotional images, social media assets, and marketing materials using
        our AI-powered media generation tools.
      </p>
    </main>
  );
}

export default function MediaPage() {
  return (
    <RBACGuard allowedRoles={['admin']}>
      <MediaContent />
    </RBACGuard>
  );
}
