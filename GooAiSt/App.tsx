
import React, { useState, useEffect } from 'react';
import { AgentCard } from './components/AgentCard';
import { ChatArea } from './components/ChatArea';
import { RightSidebar } from './components/RightSidebar';
import { Logo } from './components/Logo';
import { AGENTS, INITIAL_FILES } from './constants';
import { AgentId, ChatState, Message, TodoItem } from './types';
import { sendMessageToApi, generateMediaApi } from './services/mockApi';

// Re-implementing basic uuid for standalone simplicity
const simpleId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [activeAgentId, setActiveAgentId] = useState<AgentId>('sous_chef');
  const [chatState, setChatState] = useState<ChatState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [files] = useState(INITIAL_FILES);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review weekend prep', completed: false },
    { id: '2', text: 'Order truffles', completed: true },
  ]);

  // Initialize chat state for all agents
  useEffect(() => {
    const initialState: ChatState = {};
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

    try {
      const response = await sendMessageToApi(activeAgentId, text, currentSession.sessionId);
      
      const botMsg: Message = {
        id: simpleId(),
        role: 'assistant',
        text: response.reply,
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaAction = async (action: 'image' | 'video' | 'gallery') => {
    if (action === 'gallery') {
       // Logic to open gallery (mocked)
       alert("Opening Media Gallery Assets...");
       return;
    }

    // Use the last user message as prompt or a default
    const lastUserMsg = [...currentSession.messages].reverse().find(m => m.role === 'user');
    const prompt = lastUserMsg?.text || "A beautiful plated dish";

    const systemMsg: Message = {
        id: simpleId(),
        role: 'assistant',
        text: `Creating ${action} for prompt: "${prompt}"...`,
        timestamp: Date.now()
    };
    
    // Add system feedback
    setChatState(prev => ({
        ...prev,
        [activeAgentId]: {
          ...prev[activeAgentId],
          messages: [...(prev[activeAgentId]?.messages || []), systemMsg]
        }
    }));
    
    setIsLoading(true);
    await generateMediaApi(action, prompt);
    setIsLoading(false);
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
    <div className="flex h-screen w-full bg-background p-4 md:p-6 gap-6">
      
      {/* Left Sidebar (320px fixed) */}
      <aside className="w-[320px] hidden lg:flex flex-col gap-8 flex-shrink-0">
        <Logo />
        
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {AGENTS.map(agent => (
            <AgentCard 
              key={agent.id}
              agent={agent} 
              isActive={activeAgentId === agent.id}
              onClick={setActiveAgentId}
            />
          ))}
        </div>

        <div className="text-[10px] text-textSecondary p-4 text-center opacity-40">
          Chef's Mind AI v1.0.4 <br/> Protected by FoodAuth™
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full">
        <ChatArea 
          activeAgent={activeAgent}
          messages={currentSession.messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onMediaAction={handleMediaAction}
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
};

export default App;
