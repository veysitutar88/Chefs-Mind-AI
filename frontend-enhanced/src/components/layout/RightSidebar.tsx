'use client';

import React, { useState } from 'react';
import { useSidebarData } from '@/lib/useSidebarData';
import { MediaThumbnail } from '@/components/ui/MediaThumbnail';

interface RightSidebarProps {
  onClose: () => void;
}

export function RightSidebar({ onClose }: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { media, chats, calendar, refresh } = useSidebarData();

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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recent Media Section */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>🎨</span>
            Recent Media
          </h3>
          <div className="space-y-1 text-sm">
            {media.loading ? (
              // Loading skeleton
              <>
                <div className="animate-pulse bg-slate-800 rounded h-16" />
                <div className="animate-pulse bg-slate-800 rounded h-16" />
                <div className="animate-pulse bg-slate-800 rounded h-16" />
              </>
            ) : media.error ? (
              // Error state
              <div className="text-xs text-red-400 px-3 py-2">
                Unable to load media
              </div>
            ) : media.items.length === 0 ? (
              // Empty state
              <div className="text-xs text-slate-500 px-3 py-2">
                No media generated yet
              </div>
            ) : (
              // Render media items
              media.items.slice(0, 5).map((item) => (
                <MediaThumbnail
                  key={item.id}
                  url={item.assetUrl}
                  type={item.provider.includes('video') || item.provider.includes('veo') ? 'video' : 'image'}
                  prompt={item.prompt}
                  createdAt={item.createdAt}
                />
              ))
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>📅</span>
            Calendar
          </h3>
          <div className="text-sm text-slate-300">
            {calendar.loading ? (
              // Loading skeleton
              <>
                <div className="animate-pulse bg-slate-800 rounded h-12 mb-2" />
                <div className="animate-pulse bg-slate-800 rounded h-12" />
              </>
            ) : calendar.error ? (
              // Error state
              <div className="text-xs text-red-400">
                Unable to load calendar
              </div>
            ) : calendar.events.length === 0 ? (
              // Empty state
              <div className="text-xs text-slate-500">
                No upcoming events
              </div>
            ) : (
              // Render events
              <>
                <div className="mb-2">Upcoming: {calendar.events.length} events</div>
                <div className="space-y-2">
                  {calendar.events.slice(0, 3).map((event) => {
                    const startTime = 'dateTime' in event.start
                      ? new Date(event.start.dateTime)
                      : new Date(event.start.date);

                    return (
                      <div key={event.id} className="px-3 py-2 bg-slate-800 rounded text-xs">
                        <div className="font-medium truncate">{event.summary}</div>
                        <div className="text-slate-500">
                          {startTime.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats - Recent Chats */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <span>💬</span>
            Recent Chats
          </h3>
          <div className="space-y-2 text-sm">
            {chats.loading ? (
              // Loading skeleton
              <>
                <div className="animate-pulse bg-slate-800 rounded h-10" />
                <div className="animate-pulse bg-slate-800 rounded h-10" />
              </>
            ) : chats.error ? (
              // Error state
              <div className="text-xs text-red-400">
                Unable to load chats
              </div>
            ) : chats.sessions.length === 0 ? (
              // Empty state
              <div className="text-xs text-slate-500">
                No chat sessions yet
              </div>
            ) : (
              // Render chat sessions
              chats.sessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center px-3 py-2 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-300 truncate">
                      {session.title || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {session.agentType}
                    </div>
                  </div>
                  {session.messageCount && (
                    <span className="text-xs font-semibold text-cyan-500">
                      {session.messageCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
