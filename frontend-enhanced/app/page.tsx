"use client";
export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chef's Mind — Enhanced Console</h1>
      <p className="text-sm text-gray-600">E2E smoke: proxy /health</p>
      <a className="underline text-blue-600" href="/health" target="_blank">
        /health
      </a>
    </main>
  );
}