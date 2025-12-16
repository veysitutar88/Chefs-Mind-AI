'use client';

import { useState } from 'react';
import { RBACGuard } from '../../components/RBACGuard';
import ChatHistory from '../../../components/chat/ChatHistory';

function ChatHistoryContent() {
  const [activeTab, setActiveTab] = useState<'history' | 'active'>('active');

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">История чатов</h1>
        
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'active'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Активный чат
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'history'
                ? 'bg-white shadow-sm text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            История
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <ChatHistory />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Активная сессия чата</h2>
          <p className="text-gray-600 mb-4">
            Текущая активная сессия чата с ИИ-ассистентами. Все сообщения автоматически сохраняются в истории.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">Активный агент</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <p className="font-medium">Chef Agent</p>
                  <p className="text-sm text-gray-600">Специалист по кухне</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">Статус сессии</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-green-700">Активна</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Последняя активность: сегодня, 10:30
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Напоминание</h3>
            <p className="text-yellow-700">
              Все сообщения из активной сессии автоматически сохраняются в истории чатов.
              Вы можете просмотреть их в разделе "История" или в любое время вернуться к предыдущим разговорам.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatHistoryPage() {
  return (
    <RBACGuard requireAdmin={true}>
      <ChatHistoryContent />
    </RBACGuard>
  );
}