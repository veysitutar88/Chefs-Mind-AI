'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatShell } from '../ui/ChatShell';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  text: string;
  agent?: string;
  intent?: string;
  timestamp: number;
}

type AgentId = 'souschef' | 'gastrocount' | 'gastromind' | 'foodframe' | null;

interface ChatInterfaceProps {
  initialAgentId: AgentId;
  title?: string;
  subtitle?: string;
}

export function ChatInterface({ initialAgentId, title, subtitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      text: 'Session started',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, files?: File[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch('/api/enhanced-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          agentId: initialAgentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add agent response
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        text: data.response || 'No response',
        agent: data.agent || 'Unknown',
        intent: data.intent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        text: 'Ошибка запроса к агенту, попробуйте ещё раз.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatShell>
      {/* Header Area */}
      {(title || subtitle) && (
        <div className="border-b border-slate-800 p-4">
          {title && <h1 className="text-2xl font-semibold text-slate-200">{title}</h1>}
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 1 && (
          <div className="text-center text-slate-400 mt-20">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
            <p className="text-sm">Ask anything about your restaurant operations</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 p-4">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </ChatShell>
  );
}
