'use client';

export function BuildBadge() {
  const ts = process.env.NEXT_PUBLIC_BUILD_TS || 'dev';
  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-sm shadow-lg z-50">
      Build: {ts}
    </div>
  );
}