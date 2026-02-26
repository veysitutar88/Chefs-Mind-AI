'use client';
/* =========================================================
   Chef's AI OS — UICanon v2.5 — Main Page
   ========================================================= */

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout, useApp } from '@/components/layout/AppLayout';
import { ChatArea } from '@/components/ui/ChatArea';
import { AGENTS } from '@/constants/ui';
import { AgentId, Message, ChatSession } from '@/types/ui';

/* ---------------------------------------------------------
   ID generator
--------------------------------------------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------------------------------------------------------
   Inner page — has access to AppContext
--------------------------------------------------------- */
function ChatPage() {
  const { activeAgentId } = useApp();

  const [chatSessions, setChatSessions] = useState<Record<AgentId, ChatSession>>(
    {} as Record<AgentId, ChatSession>
  );
  const [agentModels, setAgentModels] = useState<Record<AgentId, string>>({} as Record<AgentId, string>);
  const [isLoading, setIsLoading] = useState(false);

  /* Initialize sessions on mount */
  useEffect(() => {
    const init: Record<AgentId, ChatSession> = {} as Record<AgentId, ChatSession>;
    AGENTS.forEach(a => {
      init[a.id] = { sessionId: uid(), messages: [], agentId: a.id };
    });
    setChatSessions(init);
  }, []);

  const activeAgent = AGENTS.find(a => a.id === activeAgentId) || AGENTS[0];
  const currentSession = chatSessions[activeAgentId] || { sessionId: 'init', messages: [], agentId: activeAgentId };

  const pushMessage = useCallback((agentId: AgentId, msg: Message) => {
    setChatSessions(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        messages: [...(prev[agentId]?.messages || []), msg],
      },
    }));
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: uid(), role: 'user', text, timestamp: Date.now(), agentId: activeAgentId };
    pushMessage(activeAgentId, userMsg);
    setIsLoading(true);

    try {
      const res = await fetch('/api/enhanced-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agentId: activeAgentId,
          sessionId: currentSession.sessionId,
          modelId: agentModels[activeAgentId] || undefined,
        }),
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const data = await res.json();
      const replyText = data.response || data.reply || data.message || '(No response)';
      const botMsg: Message = { id: uid(), role: 'assistant', text: replyText, timestamp: Date.now(), agentId: activeAgentId };
      pushMessage(activeAgentId, botMsg);
    } catch (err) {
      const errMsg: Message = {
        id: uid(),
        role: 'system',
        text: `⚠️ ${err instanceof Error ? err.message : 'Failed to reach server. Is backend running?'}`,
        timestamp: Date.now(),
        agentId: activeAgentId,
      };
      pushMessage(activeAgentId, errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [activeAgentId, agentModels, currentSession.sessionId, isLoading, pushMessage]);

  const handleModelChange = (modelId: string) => {
    setAgentModels(prev => ({ ...prev, [activeAgentId]: modelId }));
  };

  return (
    <ChatArea
      activeAgent={activeAgent}
      messages={currentSession.messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading}
      selectedModelId={agentModels[activeAgentId] || null}
      onModelChange={handleModelChange}
    />
  );
}

/* ---------------------------------------------------------
   Page export — wraps with AppLayout (provides Context)
--------------------------------------------------------- */
export default function Home() {
  return (
    <AppLayout>
      <ChatPage />
    </AppLayout>
  );
}
