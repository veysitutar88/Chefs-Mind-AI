'use client';

import { useState } from 'react';
import { ChatSession, ChatMessage } from './ChatHistory';

interface ChatSessionDetailProps {
  session: ChatSession;
  messages: ChatMessage[];
  onUpdateTitle: (sessionId: string, title: string) => Promise<void>;
  onCloseSession: (sessionId: string) => Promise<void>;
}

export default function ChatSessionDetail({
  session,
  messages,
  onUpdateTitle,
  onCloseSession,
}: ChatSessionDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(session.title);
  const [isClosing, setIsClosing] = useState(false);

  const handleTitleSave = async () => {
    if (editedTitle.trim() !== session.title) {
      await onUpdateTitle(session.id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCloseSession = async () => {
    setIsClosing(true);
    try {
      await onCloseSession(session.id);
    } finally {
      setIsClosing(false);
    }
  };

  const getAgentLabel = (agentType: string) => {
    const agentLabels: Record<string, string> = {
      chef: 'Повар',
      accountant: 'Бухгалтер',
      researcher: 'Исследователь',
      media: 'Медиа',
      'qa-gate': 'Контроль качества',
    };
    return agentLabels[agentType] || agentType;
  };

  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    let label = '';
    
    switch (status) {
      case 'active':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        label = 'Активна';
        break;
      case 'closed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        label = 'Закрыта';
        break;
      case 'archived':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = 'Архив';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = status;
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageRole = (role: string) => {
    switch (role) {
      case 'user':
        return 'Пользователь';
      case 'assistant':
        return 'Ассистент';
      case 'system':
        return 'Система';
      default:
        return role;
    }
  };

  const formatIntent = (intent?: string) => {
    if (!intent) return null;
    
    const intentLabels: Record<string, string> = {
      cooking: 'Кулинария',
      finance: 'Финансы',
      research: 'Исследование',
      media: 'Медиа',
      qa: 'Контроль качества',
    };
    
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
        {intentLabels[intent] || intent}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Заголовок сессии */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b">
        <div>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="border rounded px-2 py-1 mr-2"
                autoFocus
              />
              <button
                onClick={handleTitleSave}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-1"
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setEditedTitle(session.title);
                  setIsEditing(false);
                }}
                className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded"
              >
                Отмена
              </button>
            </div>
          ) : (
            <h2 className="text-xl font-bold">{session.title}</h2>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {getAgentLabel(session.agentType)}
            </span>
            {getStatusBadge(session.status)}
          </div>
        </div>
        <div className="flex">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded mr-2 hover:bg-gray-300"
            >
              Изменить название
            </button>
          )}
          {session.status === 'active' && (
            <button
              onClick={handleCloseSession}
              disabled={isClosing}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isClosing ? 'Закрытие...' : 'Закрыть сессию'}
            </button>
          )}
        </div>
      </div>
      
      {/* Информация о сессии */}
      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Создана:</span> {formatDate(session.createdAt)}
        </div>
        <div>
          <span className="text-gray-500">Обновлена:</span> {formatDate(session.updatedAt)}
        </div>
      </div>
      
      {/* Сообщения */}
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b font-medium">
          Сообщения ({messages.length})
        </div>
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Нет сообщений в этой сессии</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-50 ml-10'
                      : message.role === 'assistant'
                      ? 'bg-green-50 mr-10'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">
                      {formatMessageRole(message.role)}
                      {message.agent && (
                        <span className="ml-2 text-gray-500">
                          ({message.agent})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                  
                  {message.intent && (
                    <div className="mb-2">{formatIntent(message.intent)}</div>
                  )}
                  
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.metadata && Object.keys(message.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Метаданные
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(message.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}