'use client' 

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import GoogleConnect from '../../components/GoogleConnect.tsx'
import io from 'socket.io-client'
import type { Socket } from 'socket.io-client'

type ChatMessage = {
  text: string;
  type: 'system' | 'agent' | 'user';
  timestamp?: number | string;
}

function Page() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Подключаемся к WebSocket серверу
    const newSocket = io('http://localhost:5002');
    setSocket(newSocket);

    // Обработчик приветственного сообщения
    newSocket.on('welcome', (data) => {
      console.log('Приветственное сообщение:', data);
      setMessages(prev => [...prev, { text: data.message, type: 'system' }]);
    });

    // Обработчик ответа от агента
    newSocket.on('agent_response', (data) => {
      console.log('Ответ от агента:', data);
      setMessages(prev => [...prev, { text: data.text, type: 'agent', timestamp: data.timestamp }]);
    });

    // Очищаем соединение при размонтировании компонента
    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      // Отправляем сообщение на сервер
      socket.emit('chat_message', { text: inputMessage });
      
      // Добавляем наше сообщение в список для отображения
      setMessages(prev => [...prev, { text: inputMessage, type: 'user' }]);
      
      // Очищаем поле ввода
      setInputMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Панель управления Chef's Mind AI
          </h1>
          <p className="text-gray-600">
            Интеллектуальная система управления рестораном с 5 специализированными агентами
          </p>
        </header>

        <GoogleConnect />

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Чат в реальном времени</h2>
          
          <div className="mb-4 h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : msg.type === 'agent' ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  )
}

export default Page