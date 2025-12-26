'use client';

import React from 'react';
import { AGENT_CANON } from '@/config/agents';

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

// Map backend roles to canonical IDs
const roleToId: Record<string, string> = {
  'Chef': 'souschef',
  'Accountant': 'gastrocount',
  'Researcher': 'gastromind',
  'Media': 'foodframe',
  'Quality': 'quality', // Special case
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

  // Agent message mapping
  const id = message.agent ? roleToId[message.agent] || message.agent.toLowerCase().replace(/[^a-z]/g, '') : null;
  const agent = id && id in AGENT_CANON ? AGENT_CANON[id as keyof typeof AGENT_CANON] : null;

  const displayData = agent ? {
    name: agent.label,
    icon: agent.icon,
    color: id === 'souschef' ? 'border-orange-500' :
      id === 'gastrocount' ? 'border-green-500' :
        id === 'gastromind' ? 'border-purple-500' :
          id === 'foodframe' ? 'border-pink-500' : 'border-slate-700'
  } : message.agent === 'Quality' ? {
    name: 'QA-Gate',
    icon: '✓',
    color: 'border-blue-500'
  } : {
    name: message.agent || 'AI',
    icon: '🤖',
    color: 'border-slate-700'
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{displayData.icon}</span>
          <span className="text-sm font-medium text-slate-300">{displayData.name}</span>
        </div>
        <div className={`bg-slate-800 text-slate-50 rounded-xl px-4 py-3 border ${displayData.color}`}>
          {message.text}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
