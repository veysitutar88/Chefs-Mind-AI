'use client';

import React, { useState, useEffect } from 'react';
import { AgentCard } from '@/components/ui/AgentCard';
import { ChatArea } from '@/components/ui/ChatArea';
import { RightSidebar } from '@/components/ui/RightSidebar';
import { Logo } from '@/components/ui/Logo';
import { AGENTS, INITIAL_FILES } from '@/constants/ui';
import { AgentId, Message, TodoItem, ChatSession, FileItem } from '@/types/ui';

// Simple ID generator
const simpleId = () => Math.random().toString(36).substring(2, 9);

export default function Home() {
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('sous_chef');
  const [chatState, setChatState] = useState<Record<AgentId, ChatSession>>({} as Record<AgentId, ChatSession>);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([...INITIAL_FILES]);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review weekend prep', completed: false },
    { id: '2', text: 'Order truffles', completed: true },
  ]);

  // Media State for FoodFrame
  const [mediaOptions, setMediaOptions] = useState({
    model: 'imagen-3', // Default, will be updated by selector if needed
    format: '1:1',
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
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Assuming the backend returns { reply: string } or similar
      // Adjust based on actual API contract if needed
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

  const handleMediaAction = async (action: 'image' | 'video' | 'gallery') => {
    if (action === 'gallery') {
      alert("Opening Media Gallery Assets...");
      return;
    }

    const systemMsg: Message = {
      id: simpleId(),
      role: 'assistant',
      text: `Creating ${action} with ${mediaOptions.model} (${mediaOptions.format})...`,
      timestamp: Date.now()
    };

    setChatState(prev => ({
      ...prev,
      [activeAgentId]: {
        ...prev[activeAgentId],
        messages: [...(prev[activeAgentId]?.messages || []), systemMsg]
      }
    }));

    // Call Backend API
    try {
      const endpoint = action === 'image' ? '/api/media/generate/image' : '/api/media/generate/video';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "A delicious gourmet dish, photorealistic, 4k", // Placeholder prompt, ideally from chat context or input
          agent: 'foodframe',
          model: mediaOptions.model,
          aspectRatio: mediaOptions.format
        })
      });

      if (res.ok) {
        const data = await res.json();
        const resultMsg: Message = {
          id: simpleId(),
          role: 'assistant',
          text: `Generated ${action}: ${data.url || 'Check gallery'}`,
          timestamp: Date.now()
        };
        setChatState(prev => ({
          ...prev,
          [activeAgentId]: {
            ...prev[activeAgentId],
            messages: [...prev[activeAgentId].messages, resultMsg]
          }
        }));

        if (action === 'image' && data.url) {
          setMediaOptions(prev => ({ ...prev, lastImage: data.url }));
        }
      } else {
        throw new Error("Generation failed");
      }
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: simpleId(),
        role: 'system',
        text: `Failed to generate ${action}.`,
        timestamp: Date.now()
      };
      setChatState(prev => ({
        ...prev,
        [activeAgentId]: {
          ...prev[activeAgentId],
          messages: [...prev[activeAgentId].messages, errorMsg]
        }
      }));
    }
  };

  const handleMediaOptionChange = (key: 'model' | 'format', value: string) => {
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
    <div className="flex h-screen w-full bg-background p-4 md:p-6 gap-6 overflow-hidden font-sans text-textPrimary selection:bg-accent/30 selection:text-white">

      {/* Left Sidebar (320px fixed) */}
      <aside className="w-[320px] hidden lg:flex flex-col gap-8 flex-shrink-0">
        <Logo className="opacity-90 hover:opacity-100 transition-opacity" />

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {AGENTS.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={activeAgentId === agent.id}
              onClick={setActiveAgentId}
            />
          ))}
        </div>

        <div className="text-[10px] text-textSecondary p-4 text-center opacity-40 hover:opacity-60 transition-opacity">
          Chef's Mind AI v2.3 <br /> Protected by FoodAuth™
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full relative z-0">
        <div className="absolute inset-0 bg-gradient-fine opacity-50 pointer-events-none -z-10 rounded-3xl"></div>
        <ChatArea
          activeAgent={activeAgent}
          messages={currentSession.messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onMediaAction={handleMediaAction}
          mediaOptions={mediaOptions}
          onMediaOptionChange={handleMediaOptionChange}
          onUpscaleComplete={handleUpscaleComplete}
        />
      </main>

      {/* Right Sidebar (280px fixed) */}
      <aside className="w-[280px] hidden xl:block flex-shrink-0">
        <RightSidebar
          files={files}
          todos={todos}
          onAddTodo={handleAddTodo}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      </aside>
    </div>
  );
}
