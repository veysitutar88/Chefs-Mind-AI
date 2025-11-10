'use client';

import { RBACGuard } from '../../components/RBACGuard';

function DashboardContent() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the Chef's Mind AI Dashboard. Monitor system health, view
        recent activities, and track key performance metrics for your restaurant
        operations.
      </p>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RBACGuard requireAdmin={true}>
      <DashboardContent />
    </RBACGuard>
  );
}
