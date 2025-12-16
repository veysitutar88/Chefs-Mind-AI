'use client';

import React, { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  currentAgent?: string;
}

export function AppLayout({ children, currentAgent }: AppLayoutProps) {
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <AppHeader currentAgent={currentAgent} />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Agent Navigation */}
        <LeftSidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Right Sidebar - Tools & Context */}
        {rightSidebarOpen && (
          <RightSidebar onClose={() => setRightSidebarOpen(false)} />
        )}

        {/* Right Sidebar Toggle (when closed) */}
        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            className="fixed right-0 top-20 bg-slate-800 p-2 rounded-l-lg hover:bg-slate-700 transition-colors"
            aria-label="Open tools sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
