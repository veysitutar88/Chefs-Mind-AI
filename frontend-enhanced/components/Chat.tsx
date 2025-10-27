"use client";

import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import StatusIndicator from "./ui/StatusIndicator.tsx";

type Status = 'calling' | 'ok' | 'timeout' | 'fallback' | 'error';

interface ChatProps {
  selectedAgent?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "server";
  timestamp: Date;
  model?: string;
}

export default function Chat({ selectedAgent = "Chef" }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<Status | null>(null);
  const [lastModelUsed, setLastModelUsed] = useState<string | undefined>(undefined);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Подключение к WebSocket серверу
    socketRef.current = io();
    
    // Обработчик входящих сообщений
    socketRef.current.on("chat_message", (data: { message: string }) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: data.message,
        sender: "server",
        timestamp: new Date()
      }]);
    });
    
    // Очистка при размонтировании компонента
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);
  
  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && selectedAgent) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: "user",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      setError(null);
      setInputValue("");
      
      try {
        if (selectedAgent === 'Universal') {
          await fetchUniversalAgentResponse(selectedAgent, inputValue);
        } else {
          await fetchEnhancedAgentResponse(selectedAgent, inputValue);
        }
      } catch (err) {
        console.error("Fetch error, falling back to WebSocket:", err);
        socketRef.current?.emit("chat_message", { agent: selectedAgent, message: inputValue });
      }
    }
  };

  const fetchUniversalAgentResponse = async (agent: string, message: string) => {
    setApiStatus('calling');
    setIsTyping(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST ? '/api/universal-ask-test' : '/api/universal-ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: agent.toLowerCase(), query: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setApiStatus('ok');
        setLastModelUsed(result.route?.model);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: result.data,
          sender: "server",
          timestamp: new Date(),
          model: result.route?.model,
        }]);
      } else {
        setApiStatus('error');
        setError(result.error || 'Unknown error from universal agent');
      }
      
    } catch (err) {
       setApiStatus('error');
       setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsTyping(false);
    }
  };
  
  const fetchEnhancedAgentResponse = async (agent: string, message: string) => {
    setIsTyping(true);
    const assistantMessageId = Date.now().toString();
    
    try {
      const response = await fetch('/api/enhanced-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agent, message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = '';
      
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        text: '',
        sender: "server",
        timestamp: new Date()
      }]);
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'content') {
                  accumulatedContent += parsed.content;
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.id === assistantMessageId) {
                      return [
                        ...prev.slice(0, -1),
                        {
                          ...lastMessage,
                          text: accumulatedContent
                        }
                      ];
                    }
                    return prev;
                  });
                } else if (parsed.type === 'error') {
                  setError(parsed.error || 'Произошла ошибка при получении ответа');
                  done = true;
                }
              } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      socketRef.current?.emit("chat_message", { agent, message });
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-md">
      <h2 className="text-xl font-bold mb-4">Чат</h2>
      
      {apiStatus && <StatusIndicator status={apiStatus} model={lastModelUsed} />}
      
      <div className="h-64 overflow-y-auto border rounded p-2 mb-4 bg-gray-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-2 p-2 rounded ${
              message.sender === "user" 
                ? "bg-blue-100 text-right ml-10" 
                : "bg-gray-100 mr-10"
            }`}
          >
            <div className="text-sm text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </div>
            <div>{message.text}</div>
             {message.sender === 'server' && message.model && (
              <div className="text-xs text-gray-400 mt-1">
                Model: {message.model}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="mb-2 p-2 rounded bg-gray-100 mr-10">
            <div className="text-sm text-gray-500">
              {new Date().toLocaleTimeString()}
            </div>
            <div>Агент печатает...</div>
          </div>
        )}
        
        {error && (
          <div className="mb-2 p-2 rounded bg-red-100 border border-red-300">
            <div className="text-sm text-red-500 font-bold">
              Ошибка:
            </div>
            <div className="text-red-700">{error}</div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}