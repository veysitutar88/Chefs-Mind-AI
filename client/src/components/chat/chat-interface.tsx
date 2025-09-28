import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatInput } from "./chat-input";
import { Message } from "./message";
import { api } from "@/lib/api";
import type { Agent, ChatMessage } from "@/types";

interface ChatInterfaceProps {
  selectedAgent: Agent;
  sessionId: string | null;
}

export function ChatInterface({ selectedAgent, sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId, 'messages'],
    queryFn: () => sessionId ? api.getMessages(sessionId) : Promise.resolve([]),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    } else {
      setMessages([]);
    }
  }, [fetchedMessages, selectedAgent]);

  const handleSendMessage = async (content: string, metadata?: any) => {
    if (!sessionId) return;

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await api.sendMessage(sessionId, content, metadata);
      
      // Replace optimistic message with real ones
      setMessages(prev => [
        ...prev.slice(0, -1), // Remove optimistic message
        result.userMessage,
        result.assistantMessage
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const getAgentDescription = () => {
    switch (selectedAgent.id) {
      case 'universal':
        return 'Gemini 2.5 Pro • GPT-5 • Автоматическая маршрутизация';
      case 'accountant':
        return 'Gemini 2.5 Pro • Структурированные таблицы • SQL Debug';
      case 'analyst':
        return 'Gemini 2.5 Pro • Анализ данных • SQL генерация';
      case 'chef':
        return 'GPT-5 • Кулинарная экспертиза';
      case 'visualizer':
        return 'Gemini 2.5 Pro • Графики и диаграммы';
      case 'media-studio':
        return 'Imagen 3 • DALL·E 3 • Veo 3';
      default:
        return 'AI Assistant';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedAgent.color}`}>
              <i className={`${selectedAgent.icon} text-sm`}></i>
            </div>
            <div>
              <h2 className="font-semibold text-foreground" data-testid="text-agent-name">{selectedAgent.name}</h2>
              <p className="text-xs text-muted-foreground">{getAgentDescription()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
              <i className="fas fa-shield-alt mr-1"></i>
              SQL Validator: Активен
            </Badge>
            <Button variant="ghost" size="sm" data-testid="button-chat-settings">
              <i className="fas fa-cog text-muted-foreground"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <i className={`${selectedAgent.icon} text-4xl mb-4`}></i>
              <h3 className="text-lg font-medium mb-2">Начните разговор с {selectedAgent.name}</h3>
              <p className="text-sm">{selectedAgent.description}</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <Message 
            key={message.id} 
            message={message} 
            agentIcon={selectedAgent.icon}
          />
        ))}
      </div>

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={!sessionId}
        agentType={selectedAgent.id}
      />
    </div>
  );
}
