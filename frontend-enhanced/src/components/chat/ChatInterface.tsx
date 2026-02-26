'use client';

import React, { useState } from 'react';
import { ChatArea } from '../ui/ChatArea';
import { AgentConfig, Message } from '@/types/ui';
import { AGENT_CANON } from '@/config/agents';

// Canonical AgentId type import if needed, or derived
type AgentId = 'souschef' | 'gastrocount' | 'gastromind' | 'foodframe' | null;

interface ChatInterfaceProps {
  initialAgentId: AgentId;
}

export function ChatInterface({ initialAgentId }: ChatInterfaceProps) {
  // 1. Resolve Agent Config from Canon
  const canonAgent = initialAgentId ? AGENT_CANON[initialAgentId] : null;
  const activeAgent: AgentConfig = canonAgent ? {
    id: canonAgent.id,
    label: canonAgent.label,
    subtitle: canonAgent.subtitle,
    iconName: canonAgent.iconName,
    icon: canonAgent.icon
  } : {
    id: 'souschef',
    label: 'Universal Chat',
    subtitle: 'Orchestrator',
    iconName: 'chef_hat',
    icon: '🍳',
  };

  // 2. State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      text: 'Session started',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // 3. Handlers
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/enhanced-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agentId: initialAgentId,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.response || 'No response',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        text: 'Connection error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatArea
      activeAgent={activeAgent}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      selectedModelId={selectedModelId}
      onModelChange={setSelectedModelId}
    />
  );
}
