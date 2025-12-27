'use client';

import React, { useState, useEffect } from 'react';
import { ChatArea } from '@/components/ui/ChatArea';
import { AppLayout } from '@/components/layout/AppLayout';
import { AGENTS, INITIAL_FILES } from '@/constants/ui';
import { AgentId, Message, TodoItem, ChatSession, FileItem } from '@/types/ui';
import { useMediaGenerator } from '@/hooks/useMediaGenerator';

// Simple ID generator
const simpleId = () => Math.random().toString(36).substring(2, 9);

export default function Home() {
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('souschef');
  const [chatState, setChatState] = useState<Record<AgentId, ChatSession>>({} as Record<AgentId, ChatSession>);
  const [agentModels, setAgentModels] = useState<Record<AgentId, string>>({} as Record<AgentId, string>); // Track model per agent
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([...INITIAL_FILES]);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review weekend prep', completed: false },
    { id: '2', text: 'Order truffles', completed: true },
  ]);

  // Media Generator Hook
  const { jobs, generateMedia, retryJob, clearJob } = useMediaGenerator({
    onMessage: (role, text) => {
      const msg: Message = {
        id: simpleId(),
        role,
        text,
        timestamp: Date.now()
      };
      setChatState(prev => ({
        ...prev,
        [activeAgentId]: {
          ...prev[activeAgentId] || {},
          messages: [...(prev[activeAgentId]?.messages || []), msg]
        }
      }));
    }
  });

  // Media State options (UI only)
  const [mediaOptions, setMediaOptions] = useState({
    model: 'imagen-3',
    format: '1:1',
    quality: 'standard' as 'standard' | 'hd' | 'premium',
    seed: null as number | null,
    steps: 30,
    lastImage: null as string | null
  });

  // Initialize chat state for all agents
  useEffect(() => {
    const initialState: Record<AgentId, ChatSession> = {} as Record<AgentId, ChatSession>;
    AGENTS.forEach(agent => {
      initialState[agent.id] = {
        messages: [],
        sessionId: simpleId()
      };
    });
    setChatState(initialState);
  }, []);

  const activeAgent = AGENTS.find(a => a.id === activeAgentId) || AGENTS[0];
  const currentSession = chatState[activeAgentId] || { messages: [], sessionId: 'init' };

  const handleModelChange = (modelId: string) => {
    setAgentModels(prev => ({
      ...prev,
      [activeAgentId]: modelId
    }));
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: simpleId(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    // Optimistic update
    setChatState(prev => ({
      ...prev,
      [activeAgentId]: {
        ...prev[activeAgentId],
        messages: [...(prev[activeAgentId]?.messages || []), userMsg]
      }
    }));

    setIsLoading(true);

    try {
      const response = await fetch('/api/enhanced-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          agentId: activeAgentId,
          sessionId: currentSession.sessionId,
          modelId: agentModels[activeAgentId] || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const replyText = data.reply || data.message || "I received your message but got no text back.";

      const botMsg: Message = {
        id: simpleId(),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now()
      };

      setChatState(prev => ({
        ...prev,
        [activeAgentId]: {
          ...prev[activeAgentId],
          messages: [...prev[activeAgentId].messages, botMsg]
        }
      }));
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMsg: Message = {
        id: simpleId(),
        role: 'system',
        text: `Error: Failed to communicate with the chef. (${error instanceof Error ? error.message : 'Unknown error'})`,
        timestamp: Date.now()
      };
      setChatState(prev => ({
        ...prev,
        [activeAgentId]: {
          ...prev[activeAgentId],
          messages: [...prev[activeAgentId].messages, errorMsg]
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaAction = (action: 'image' | 'video' | 'gallery') => {
    if (action === 'gallery') {
      // Logic for gallery tab opening could go here (e.g. modify Sidebar active tab via context/prop if lifted, but right now sidebar state is internal)
      // We'll just alert for now or assume sidebar is handling it
      return;
    }

    const payload = {
      prompt: "A delicious gourmet dish, photorealistic, 4k", // Should come from input
      agent: 'foodframe',
      modelId: mediaOptions.model,
      aspectRatio: mediaOptions.format,
      quality: mediaOptions.quality,
      seed: mediaOptions.seed,
      steps: mediaOptions.steps,
      negativePrompt: ""
    };

    generateMedia(action, payload);
  };

  const handleMediaOptionChange = (key: 'model' | 'format' | 'quality' | 'seed' | 'steps', value: string | number | null) => {
    setMediaOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleUpscaleComplete = (url: string) => {
    setMediaOptions(prev => ({ ...prev, lastImage: url }));
    // Optionally add a message to chat
    const msg: Message = {
      id: simpleId(),
      role: 'assistant',
      text: `Upscaled image: ${url}`,
      timestamp: Date.now()
    };
    setChatState(prev => ({
      ...prev,
      [activeAgentId]: {
        ...prev[activeAgentId],
        messages: [...prev[activeAgentId].messages, msg]
      }
    }));
  };

  // Todo Handlers
  const handleAddTodo = (text: string) => {
    setTodos(prev => [{ id: simpleId(), text, completed: false }, ...prev]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppLayout>
      <ChatArea
        activeAgent={activeAgent}
        messages={currentSession.messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onMediaAction={handleMediaAction}
        mediaOptions={mediaOptions}
        onMediaOptionChange={handleMediaOptionChange}
        onUpscaleComplete={handleUpscaleComplete}
        selectedModelId={agentModels[activeAgentId] || null}
        onModelChange={handleModelChange}
      />
    </AppLayout>
  );
}
