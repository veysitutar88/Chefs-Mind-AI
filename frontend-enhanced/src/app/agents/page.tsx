'use client';

import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';
import { RBACGuard } from '../../components/RBACGuard';
import SkeletonLoader from '../../components/ui/SkeletonLoader';

type ChatMessage = {
  text: string;
  type: 'system' | 'agent' | 'user';
  timestamp?: number | string;
  agent?: 'chef' | 'accountant' | 'research' | 'media' | 'universal';
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001';

// Роли агентов с описаниями
const AGENT_ROLES = [
  { id: 'chef', name: 'Chef', description: 'Кулинарный эксперт', icon: '👨‍🍳' },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Финансовый аналитик',
    icon: '💰',
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Исследователь данных',
    icon: '🔍',
  },
  { id: 'media', name: 'Media', description: 'Создатель контента', icon: '🎨' },
  {
    id: 'universal',
    name: 'Universal',
    description: 'Универсальный помощник',
    icon: '🤖',
  },
];

export default function Agents() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('universal');
  const [isLoading, setIsLoading] = useState(false);

  // Инициализация с приветственным сообщением
  useEffect(() => {
    setMessages([
      {
        text: "Добро пожаловать в чат с агентами Chef's Mind AI! Выберите агента и начните общение.",
        type: 'system',
        timestamp: Date.now(),
      },
      {
        text: 'Я ваш универсальный помощник. Чем могу помочь?',
        type: 'agent',
        agent: 'universal',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Добавляем сообщение пользователя
    const userMessage: ChatMessage = {
      text: inputMessage,
      type: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Очищаем поле ввода
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Отправляем запрос к агенту
      const res = await fetch(`${API_BASE}/api/universal-ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedAgent,
          query: messageToSend,
        }),
      });

      const result = await res.json();

      // Добавляем ответ агента
      const agentMessage: ChatMessage = {
        text:
          result?.data ?? 'Извините, произошла ошибка при получении ответа.',
        type: 'agent',
        agent: selectedAgent as any,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (e) {
      // Добавляем сообщение об ошибке
      const errorMessage: ChatMessage = {
        text: 'Извините, произошла ошибка при обращении к агенту. Попробуйте позже.',
        type: 'system',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const getAgentInfo = (agentId: string) => {
    return AGENT_ROLES.find(agent => agent.id === agentId) || AGENT_ROLES[4]; // universal по умолчанию
  };

  const getMessageStyle = (msg: ChatMessage) => {
    if (msg.type === 'user') {
      return 'bg-indigo-600 text-white ml-auto';
    } else if (msg.type === 'agent') {
      return 'bg-slate-100 text-slate-800 border-l-4 border-indigo-500';
    } else {
      return 'bg-amber-50 text-amber-800 border-l-4 border-amber-400';
    }
  };

  const getAgentBadge = (agentId?: string) => {
    if (!agentId) return null;
    const agent = getAgentInfo(agentId);
    return (
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
        <span>{agent.icon}</span>
        <span>{agent.name}</span>
      </div>
    );
  };

  return (
    <RBACGuard
      allowedRoles={['admin', 'chef', 'accountant', 'media', 'researcher']}
    >
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Заголовок */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Агенты Chef's Mind AI
            </h1>
            <p className="text-slate-600">
              Общайтесь с нашими специализированными агентами для решения задач
              ресторана
            </p>
          </div>

          {/* Селектор агента */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              Выбор агента
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {AGENT_ROLES.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedAgent === agent.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">{agent.icon}</div>
                  <div className="font-medium text-slate-900 mb-1">
                    {agent.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {agent.description}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm text-indigo-800">
                <strong>Активный агент:</strong>{' '}
                {getAgentInfo(selectedAgent).name} —{' '}
                {getAgentInfo(selectedAgent).description}
              </p>
            </div>
          </div>

          {/* Чат интерфейс */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Чат с агентом
              </h2>
            </div>

            {/* Область сообщений */}
            <div className="h-96 overflow-y-auto p-6 bg-slate-50">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <SkeletonLoader lines={1} />
                  <SkeletonLoader lines={2} />
                  <SkeletonLoader lines={1} />
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-lg ${getMessageStyle(msg)}`}
                  >
                    {msg.type === 'agent' && getAgentBadge(msg.agent)}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.timestamp && (
                      <div className="text-xs opacity-70 mt-2">
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Индикатор загрузки */}
              {isLoading && (
                <div className="mb-4 flex justify-start">
                  <div className="max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-lg bg-slate-100 border-l-4 border-indigo-500">
                    {getAgentBadge(selectedAgent)}
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className="text-sm">Агент думает...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Поле ввода */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder={`Задайте вопрос агенту ${getAgentInfo(selectedAgent).name}...`}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-lg transition-colors flex items-center gap-2 min-w-[80px] justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">Отправить</span>
                    </>
                  )}
                </button>
              </div>

              {/* Подсказки */}
              <div className="mt-3 text-xs text-slate-500">
                Нажмите{' '}
                <kbd className="px-2 py-1 bg-slate-200 rounded">Enter</kbd> для
                отправки,{' '}
                <kbd className="px-2 py-1 bg-slate-200 rounded">
                  Shift + Enter
                </kbd>{' '}
                для новой строки
              </div>
            </div>
          </div>

          {/* Информационная панель */}
          <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Bot className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">
                  Специализированные агенты
                </h3>
                <p className="text-indigo-700 text-sm leading-relaxed">
                  Каждый агент имеет свою область экспертизы. Chef поможет с
                  кулинарными вопросами, Accountant — с финансами, Research — с
                  анализом данных, Media — с контентом, а Universal решает
                  широкий спектр задач.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RBACGuard>
  );
}
