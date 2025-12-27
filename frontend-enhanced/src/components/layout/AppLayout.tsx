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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-50">
      {/* Header */}
      <AppHeader currentAgent={currentAgent} />

      {/* Main Layout (3 Columns) */}
      <div className="flex-1 w-full h-full overflow-hidden flex">
        {/* Left Sidebar - Agent Navigation */}
        <div className="hidden lg:flex h-full flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-hidden relative flex flex-col">
          {children}
        </main>

        {/* Right Sidebar - Tools & Context */}
        {rightSidebarOpen && (
          <div className="hidden xl:flex h-full border-l border-white/5 flex-shrink-0">
            <RightSidebar onClose={() => setRightSidebarOpen(false)} />
          </div>
        )}

        {/* Right Sidebar Toggle (when closed - Desktop only) */}
        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            className="fixed right-0 top-20 bg-slate-800 p-2 rounded-l-lg hover:bg-slate-700 transition-colors hidden xl:block"
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
