'use client';

import { useState, useEffect } from 'react';
import { RBACGuard } from '../../components/RBACGuard';
import { Button } from '../../components/ui/button';
import { Send } from 'lucide-react';

type ChatMessage = {
  id: string;
  text: string;
  type: 'system' | 'agent' | 'user';
  timestamp: number;
  agent?: string;
  intent?: string;
};

type AgentInfo = {
  name: string;
  displayName: string;
  emoji: string;
  color: string;
  description: string;
};

function DashboardContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentInfo>({
    name: 'Chef',
    displayName: 'Chef Agent',
    emoji: '👨‍🍳',
    color: 'orange',
    description: 'Специалист по кухне'
  });

  // Карта агентов с их информацией
  const getAgentInfo = (agentName: string): AgentInfo => {
    const agents: Record<string, AgentInfo> = {
      'Chef': {
        name: 'Chef',
        displayName: 'Chef Agent',
        emoji: '👨‍🍳',
        color: 'orange',
        description: 'Специалист по кухне'
      },
      'Accountant': {
        name: 'Accountant',
        displayName: 'Accountant Agent',
        emoji: '💰',
        color: 'green',
        description: 'Финансовый консультант'
      },
      'Researcher': {
        name: 'Researcher',
        displayName: 'Researcher Agent',
        emoji: '🔍',
        color: 'blue',
        description: 'Исследователь рынка'
      },
      'Media': {
        name: 'Media',
        displayName: 'Media Agent',
        emoji: '🎨',
        color: 'purple',
        description: 'Медиа-контент специалист'
      },
      'Quality': {
        name: 'Quality',
        displayName: 'Quality Agent',
        emoji: '✅',
        color: 'red',
        description: 'Контроль качества'
      }
    };

    return agents[agentName] || agents['Chef']; // По умолчанию Chef
  };

  // Добавляем приветственное сообщение при загрузке
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Добро пожаловать в Chef\'s Mind AI! Я ваш ИИ-ассистент. Задайте любой вопрос о ресторанном бизнесе.',
        type: 'system',
        timestamp: Date.now()
      }
    ]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      type: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/enhanced-agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: 'restaurant_management'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Извините, произошла ошибка при обработке вашего запроса.',
        type: 'agent',
        timestamp: Date.now(),
        agent: data.agent,
        intent: data.intent
      };

      // Обновляем текущего агента если он изменился
      if (data.agent && data.agent !== currentAgent.name) {
        setCurrentAgent(getAgentInfo(data.agent));
      }

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка при отправке сообщения. Попробуйте еще раз.',
        type: 'system',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Chef's Mind AI Dashboard
          </h1>
          <p className="text-gray-600">
            Ваш персональный ИИ-ассистент для управления рестораном
          </p>
        </header>

        {/* Статистика и статус */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Статус системы</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">Все системы работают</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Активный агент</h3>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-${currentAgent.color}-100 rounded-full flex items-center justify-center`}>
                {currentAgent.emoji}
              </div>
              <div>
                <div className="font-medium">{currentAgent.displayName}</div>
                <div className="text-sm text-gray-500">{currentAgent.description}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Сообщений сегодня</h3>
            <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
          </div>
        </div>

        {/* Чат интерфейс */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 bg-${currentAgent.color}-100 rounded-full flex items-center justify-center`}>
              {currentAgent.emoji}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{currentAgent.displayName}</h2>
              <p className="text-sm text-gray-500">{currentAgent.description}</p>
            </div>
          </div>

          {/* Область сообщений */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 mb-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Начните разговор с вашим ИИ-ассистентом
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : message.type === 'agent'
                          ? 'bg-orange-100 text-gray-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-${currentAgent.color}-100 text-gray-800`}>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">Печатает...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Поле ввода */}
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваш вопрос о ресторанном бизнесе..."
              className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RBACGuard requireAdmin={true}>
      <DashboardContent />
    </RBACGuard>
  );
}