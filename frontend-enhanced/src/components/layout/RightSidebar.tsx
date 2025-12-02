'use client';

import React, { useState } from 'react';
import { useSidebarData } from '@/lib/useSidebarData';
import { MediaThumbnail } from '@/components/ui/MediaThumbnail';
import { FollowupWidget } from '../ui/FollowupWidget';

interface RightSidebarProps {
  onClose: () => void;
}

export function RightSidebar({ onClose }: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { media, chats, calendar, tasks, loading, error, refetchTasks, refresh } = useSidebarData();

  const searchQueryLower = searchQuery.toLowerCase();

  // Filter data based on search query
  const filteredMedia = media.items.filter(item =>
    item.prompt.toLowerCase().includes(searchQueryLower)
  );
  const filteredChats = chats.sessions.filter(session =>
    (session.title || 'Untitled Chat').toLowerCase().includes(searchQueryLower)
  );

  const filteredFollowups = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQueryLower)
  );
  const filteredEvents = calendar.events.filter(event =>
    event.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-[320px] md:w-[360px] lg:w-[400px] bg-surface border-l border-borderSoft flex flex-col animate-slide-in-right overflow-hidden">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between p-4 border-b border-borderSoft">
        <h2 className="font-semibold text-textPrimary">Tools</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors text-textSecondary hover:text-textPrimary"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Section */}
      <div className="p-4 border-b border-borderSoft">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white/5 border border-borderSoft rounded-lg text-sm text-textPrimary placeholder-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-textSecondary/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="mt-2 text-xs text-textSecondary/70">
          Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-textSecondary">⌘K</kbd> for quick search
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Recent Media Section */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
            <span>🎨</span>
            Recent Media
          </h3>
          <div className="space-y-2 text-sm">
            {media.loading ? (
              // Loading skeleton
              <>
                <div className="animate-pulse bg-white/5 rounded h-16" />
                <div className="animate-pulse bg-white/5 rounded h-16" />
                <div className="animate-pulse bg-white/5 rounded h-16" />
              </>
            ) : media.error ? (
              // Error state
              <div className="text-xs text-red-400/80 px-3 py-2 bg-red-500/10 rounded border border-red-500/20">
                Unable to load media
              </div>
            ) : filteredMedia.length === 0 ? (
              // Empty state
              <div className="text-xs text-textSecondary px-3 py-2 text-center italic bg-white/5 rounded">
                {searchQuery ? 'No matching media' : 'No media generated yet'}
              </div>
            ) : (
              // Render media items
              filteredMedia.slice(0, 5).map((item, index) => (
                <MediaThumbnail
                  key={item.id}
                  url={item.assetUrl}
                  type={item.provider.includes('video') || item.provider.includes('veo') ? 'video' : 'image'}
                  prompt={item.prompt}
                  createdAt={item.createdAt}
                  className="animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="p-4 border-t border-borderSoft">
          <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
            <span>📅</span>
            Calendar
          </h3>
          <div className="text-sm text-textSecondary">
            {calendar.loading ? (
              // Loading skeleton
              <>
                <div className="animate-pulse bg-white/5 rounded h-12 mb-2" />
                <div className="animate-pulse bg-white/5 rounded h-12" />
              </>
            ) : calendar.error ? (
              // Error state
              <div className="text-xs text-red-400/80 px-3 py-2 bg-red-500/10 rounded border border-red-500/20">
                Unable to load calendar
              </div>
            ) : filteredEvents.length === 0 ? (
              // Empty state
              <div className="text-xs text-textSecondary px-3 py-2 text-center italic bg-white/5 rounded">
                {searchQuery ? 'No matching events' : 'No upcoming events'}
              </div>
            ) : (
              // Render events
              <div className="space-y-2">
                {filteredEvents.slice(0, 3).map((event, index) => {
                  const startTime = 'dateTime' in event.start
                    ? new Date(event.start.dateTime)
                    : new Date(event.start.date);

                  const now = new Date();
                  const isToday = startTime.toDateString() === now.toDateString();
                  const dateStr = isToday ? 'Today' : startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const timeStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                  return (
                    <div
                      key={event.id}
                      className="group px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-accent/20 animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="font-medium truncate text-textPrimary group-hover:text-accent transition-colors" title={event.summary}>
                        {event.summary}
                      </div>
                      <div className="text-textSecondary/80 group-hover:text-textSecondary flex items-center gap-1.5 mt-1">
                        <span className={isToday ? "text-accent font-medium" : ""}>{dateStr}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-textSecondary/50"></span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredEvents.length > 3 && (
                  <div className="text-[10px] text-center text-textSecondary pt-1 cursor-pointer hover:text-accent transition-colors animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
                    View all {filteredEvents.length} events
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Tasks Widget (Block 8) */}
        <FollowupWidget
          tasks={filteredFollowups}
          loading={loading}
          error={error}
          onRefresh={refetchTasks}
        />

        {/* Quick Stats - Recent Chats */}
        <div className="p-4 border-t border-borderSoft">
          <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
            <span>💬</span>
            Recent Chats
          </h3>
          <div className="space-y-2 text-sm">
            {chats.loading ? (
              // Loading skeleton
              <>
                <div className="animate-pulse bg-white/5 rounded h-10" />
                <div className="animate-pulse bg-white/5 rounded h-10" />
              </>
            ) : chats.error ? (
              // Error state
              <div className="text-xs text-red-400/80 px-3 py-2 bg-red-500/10 rounded border border-red-500/20">
                Unable to load chats
              </div>
            ) : filteredChats.length === 0 ? (
              // Empty state
              <div className="text-xs text-textSecondary px-3 py-2 text-center italic bg-white/5 rounded">
                {searchQuery ? 'No matching chats' : 'No chat sessions yet'}
              </div>
            ) : (
              // Render chat sessions
              filteredChats.map((session, index) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center px-3 py-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.01] border border-transparent hover:border-accent/20 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-textPrimary/90 truncate group-hover:text-textPrimary">
                      {session.title || 'Untitled Chat'}
                    </div>
                    <div className="text-xs text-textSecondary/70">
                      {session.agentType}
                    </div>
                  </div>
                  {session.messageCount && (
                    <span className="text-xs font-semibold text-accent">
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
