'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgentsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home (Universal Chat)
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400">Redirecting...</div>
    </div>
  );
}
