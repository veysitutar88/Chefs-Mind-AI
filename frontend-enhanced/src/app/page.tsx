'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import ModelPicker from '../../components/ui/ModelPicker';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import StatusDashboard from '../../components/StatusDashboard';
import { RBACGuard } from '../components/RBACGuard';

type ChatMessage = {
  text: string;
  type: 'system' | 'agent' | 'user';
  timestamp?: number | string;
};

function Page() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [model, setModel] = useState<string>('auto');
  const [useHttpTest, setUseHttpTest] = useState<boolean>(false);

  // Включаем HTTP-тестовый режим по флагу в query (?e2e=1) или через env NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST
  useEffect(() => {
    const urlFlag =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('e2e');
    const envFlag =
      process.env.NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST === '1' ||
      process.env.NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST === 'true';
    setUseHttpTest(!!urlFlag || !!envFlag);
  }, []);

  // TODO: Re-enable WebSocket with correct port (5001) after backend implementation
  // useEffect(() => {
  //   if (useHttpTest) return;

  //   // Подключаемся к WebSocket серверу
  //   const newSocket = io('http://localhost:5001');
  //   setSocket(newSocket);

  //   // Обработчик приветственного сообщения
  //   newSocket.on('welcome', (data) => {
  //     console.log('Приветственное сообщение:', data);
  //     setMessages(prev => [...prev, { text: data.message, type: 'system' }]);
  //   });

  //   // Обработчик ответа от агента
  //   newSocket.on('agent_response', (data) => {
  //     console.log('Ответ от агента:', data);
  //     setMessages(prev => [...prev, { text: data.text, type: 'agent', timestamp: data.timestamp }]);
  //   });

  //   // Очищаем соединение при размонтировании компонента
  //   return () => {
  //     newSocket.close();
  //   };
  // }, [useHttpTest]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Добавляем наше сообщение в список для отображения
    setMessages(prev => [...prev, { text: inputMessage, type: 'user' }]);

    // Очищаем поле ввода, но запоминаем
    const messageToSend = inputMessage;
    setInputMessage('');

    if (useHttpTest) {
      try {
        const path =
          process.env.NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST === '1' ||
          process.env.NEXT_PUBLIC_USE_UNIVERSAL_ASK_TEST === 'true'
            ? '/api/universal-ask-test'
            : '/api/universal-ask';

        const res = await fetch(path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'universal', query: messageToSend }),
        });

        const result = await res.json();
        setMessages(prev => [
          ...prev,
          { text: result?.data ?? 'Тестовый ответ', type: 'agent' },
        ]);
      } catch (e) {
        setMessages(prev => [
          ...prev,
          { text: 'Ошибка тестового запроса', type: 'system' },
        ]);
      }
    } else if (socket) {
      // Отправляем сообщение на сервер через WebSocket
      socket.emit('chat_message', { text: messageToSend });
    }
  };

  return (
    <RBACGuard
      allowedRoles={['admin', 'chef', 'accountant', 'media', 'researcher']}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Панель управления Chef's Mind AI
            </h1>
            <p className="text-gray-600">
              Интеллектуальная система управления рестораном с 5
              специализированными агентами
            </p>
          </header>

          <div className="mt-6">
            <StatusDashboard />
          </div>

          <div className="mt-6 bg-white rounded-xl shadow p-4 border border-amber-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Параметры ИИ
            </h3>
            <div className="max-w-sm">
              <ModelPicker
                value={model}
                onChange={setModel}
                includeAuto
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Чат в реальном времени
            </h2>

            <div className="mb-4 h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
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
                  className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <span
                    className={`inline-block p-2 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : msg.type === 'agent' ? 'bg-green-100' : 'bg-gray-200'}`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите сообщение..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </RBACGuard>
  );
}

export default Page;
