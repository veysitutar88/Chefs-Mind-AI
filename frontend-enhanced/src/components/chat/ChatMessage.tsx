'use client';

import React from 'react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  text: string;
  agent?: string;
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

const agentInfo: Record<string, { name: string; icon: string; color: string }> = {
  'Chef': { name: 'AI Sous-Chef', icon: '👨‍🍳', color: 'border-orange-500' },
  'Accountant': { name: 'AI Brain-Chef', icon: '🧮', color: 'border-green-500' },
  'Researcher': { name: 'AI Research', icon: '🔍', color: 'border-purple-500' },
  'Media': { name: 'AI Media-Studio', icon: '🎨', color: 'border-pink-500' },
  'Quality': { name: 'QA-Gate', icon: '✓', color: 'border-blue-500' },
};

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="text-sm text-slate-500 italic">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%]">
          <div className="bg-slate-700 text-slate-50 rounded-xl px-4 py-3">
            {message.text}
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right">
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  // Agent message
  const agent = message.agent ? agentInfo[message.agent] : null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        {agent && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{agent.icon}</span>
            <span className="text-sm font-medium text-slate-300">{agent.name}</span>
          </div>
        )}
        <div className={`bg-slate-800 text-slate-50 rounded-xl px-4 py-3 border ${agent?.color || 'border-slate-700'}`}>
          {message.text}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
