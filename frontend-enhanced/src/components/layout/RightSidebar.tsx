'use client';

import React, { useState } from 'react';

interface RightSidebarProps {
  onClose: () => void;
}

export function RightSidebar({ onClose }: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <aside className="w-[320px] bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="font-semibold text-slate-200">Tools</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-slate-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">⌘K</kbd> for quick search
        </div>
      </div>

      {/* Files Browser */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>📁</span>
            Files
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
              <span>📂</span>
              <span>project_docs/</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
              <span>📂</span>
              <span>recipes/</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded cursor-pointer text-slate-300">
              <span>📂</span>
              <span>media/</span>
            </div>
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>📅</span>
            Calendar
          </h3>
          <div className="text-sm text-slate-300">
            <div className="mb-2">Today: 3 events</div>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-slate-800 rounded text-xs">
                <div className="font-medium">Team Meeting</div>
                <div className="text-slate-500">10:00 AM</div>
              </div>
              <div className="px-3 py-2 bg-slate-800 rounded text-xs">
                <div className="font-medium">Supplier Call</div>
                <div className="text-slate-500">2:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>📊</span>
            Quick Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center px-3 py-2 bg-slate-800 rounded">
              <span className="text-slate-300">Orders</span>
              <span className="font-semibold text-cyan-500">12</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 bg-slate-800 rounded">
              <span className="text-slate-300">Revenue</span>
              <span className="font-semibold text-green-500">$2,450</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2 bg-slate-800 rounded">
              <span className="text-slate-300">Inventory</span>
              <span className="font-semibold text-amber-500">⚠️ Low</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
