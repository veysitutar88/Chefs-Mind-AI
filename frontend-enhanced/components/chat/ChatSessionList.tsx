'use client';

import { ChatSession } from './ChatHistory';

interface ChatSessionListProps {
  sessions: ChatSession[];
  selectedSession: ChatSession | null;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function ChatSessionList({
  sessions,
  selectedSession,
  onSelectSession,
  onDeleteSession,
}: ChatSessionListProps) {
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
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return `Вчера ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>История чатов пуста</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`rounded-lg p-3 cursor-pointer transition-colors ${
              selectedSession?.id === session.id
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
            }`}
            onClick={() => onSelectSession(session)}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-sm truncate pr-2">{session.title}</h3>
              <button
                className="text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                title="Удалить сессию"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {getAgentLabel(session.agentType)}
                </span>
                {getStatusBadge(session.status)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(session.updatedAt)}
              </div>
            </div>
            {session.messageCount !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                Сообщений: {session.messageCount}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}