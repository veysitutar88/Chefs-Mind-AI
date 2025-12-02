'use client';

import React from 'react';
import { Task } from '@/lib/useSidebarData';

interface FollowupWidgetProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function FollowupWidget({ tasks, loading, error, onRefresh }: FollowupWidgetProps) {
  if (loading) {
    return (
      <div className="p-4 border-t border-borderSoft">
        <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
          <span>✅</span>
          Follow-up Tasks
        </h3>
        <div className="space-y-2">
          <div className="animate-pulse bg-white/5 rounded h-10" />
          <div className="animate-pulse bg-white/5 rounded h-10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-t border-borderSoft">
        <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
          <span>✅</span>
          Follow-up Tasks
        </h3>
        <div className="text-xs text-red-400/80 px-3 py-2 bg-red-500/10 rounded border border-red-500/20 flex justify-between items-center">
          <span>Unable to load tasks</span>
          <button onClick={onRefresh} className="text-red-400 hover:text-red-300 underline">Retry</button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-4 border-t border-borderSoft">
        <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
          <span>✅</span>
          Follow-up Tasks
        </h3>
        <div className="text-xs text-textSecondary px-3 py-2 text-center italic bg-white/5 rounded">
          No pending tasks
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-borderSoft">
      <h3 className="text-sm font-semibold text-textSecondary mb-3 flex items-center gap-2">
        <span>✅</span>
        Follow-up Tasks
      </h3>
      <div className="space-y-2">
        {tasks.slice(0, 5).map((task, index) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] border border-transparent hover:border-accent/20 animate-fade-in-up opacity-0"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.status === 'completed'
                ? 'bg-accent border-accent'
                : 'border-textSecondary/50 group-hover:border-accent'
              }`}>
              {task.status === 'completed' && (
                <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm truncate transition-colors ${task.status === 'completed'
                  ? 'text-textSecondary line-through'
                  : 'text-textPrimary group-hover:text-accent'
                }`}>
                {task.title}
              </div>
              {task.priority === 'high' && (
                <div className="text-[10px] text-red-400 mt-0.5 font-medium">
                  High Priority
                </div>
              )}
            </div>
          </div>
        ))}
        {tasks.length > 5 && (
          <div className="text-[10px] text-center text-textSecondary pt-1 cursor-pointer hover:text-accent transition-colors animate-fade-in-up opacity-0" style={{ animationDelay: '250ms' }}>
            View all {tasks.length} tasks
          </div>
        )}
      </div>
    </div>
  );
}