'use client';

import { RBACGuard } from '../../../../components/RBACGuard';
import { BackupManager } from '../../../../components/admin/BackupManager';

export default function AdminBackupsPage() {
  return (
    <RBACGuard requireAdmin={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <BackupManager />
        </div>
      </div>
    </RBACGuard>
  );
}