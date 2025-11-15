'use client';

import { useState, useEffect } from 'react';
import ChatSessionList from './ChatSessionList';
import ChatSessionDetail from './ChatSessionDetail';

export interface ChatSession {
  id: string;
  title: string;
  status: 'active' | 'closed' | 'archived';
  agentType: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  agent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export default function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Загрузка сессий
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filter !== 'all') {
        params.append('agentType', filter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/chat/history?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok) {
        setSessions(data.data.sessions);
        // Если есть выбранная сессия и она не отфильтровалась, выбираем первую сессию
        if (data.data.sessions.length > 0) {
          const exists = data.data.sessions.find((s: ChatSession) => s.id === selectedSession?.id);
          if (!exists && data.data.sessions[0]) {
            setSelectedSession(data.data.sessions[0]);
            // Загружаем сообщения для первой сессии
            fetchMessages(data.data.sessions[0].id);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке сессий');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка сообщений для выбранной сессии
  const fetchMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok) {
        setMessages(data.data.messages);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке сообщений');
    }
  };

  // Обновление заголовка сессии
  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Confirm-Code': sessionId // Заменить на реальный код подтверждения
        },
        credentials: 'include',
        body: JSON.stringify({ title })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok) {
        // Обновляем сессию в локальном состоянии
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, title: data.data.title } 
            : session
        ));
        
        // Обновляем выбранную сессию
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession({ ...selectedSession, title: data.data.title });
        }
      } else {
        throw new Error(data.error || 'Failed to update session title');
      }
    } catch (err) {
      console.error('Error updating session title:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении заголовка сессии');
    }
  };

  // Закрытие сессии
  const closeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Confirm-Code': sessionId // Заменить на реальный код подтверждения
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'closed' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok) {
        // Обновляем сессию в локальном состоянии
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'closed' } 
            : session
        ));
        
        // Обновляем выбранную сессию
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession({ ...selectedSession, status: 'closed' });
        }
      } else {
        throw new Error(data.error || 'Failed to close session');
      }
    } catch (err) {
      console.error('Error closing session:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при закрытии сессии');
    }
  };

  // Удаление сессии
  const deleteSession = async (sessionId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту сессию?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/chat/history/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'X-Confirm-Code': sessionId // Заменить на реальный код подтверждения
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.ok) {
        // Удаляем сессию из локального состояния
        setSessions(sessions.filter(session => session.id !== sessionId));
        
        // Если удаленная сессия была выбрана, сбрасываем выбор
        if (selectedSession && selectedSession.id === sessionId) {
          setSelectedSession(sessions.length > 1 ? sessions[0] : null);
          setMessages([]);
        }
      } else {
        throw new Error(data.error || 'Failed to delete session');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при удалении сессии');
    }
  };

  // Эффект для загрузки сессий при изменении фильтров
  useEffect(() => {
    fetchSessions();
  }, [filter, statusFilter, searchQuery]);

  // Эффект для загрузки сообщений при изменении выбранной сессии
  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession.id);
    }
  }, [selectedSession]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Список сессий */}
      <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">История чатов</h2>
        
        {/* Фильтры */}
        <div className="mb-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Поиск по заголовкам..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Агент
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">Все агенты</option>
              <option value="chef">Chef (Повар)</option>
              <option value="accountant">Accountant (Бухгалтер)</option>
              <option value="researcher">Researcher (Исследователь)</option>
              <option value="media">Media (Медиа)</option>
              <option value="qa-gate">QA-Gate (Контроль качества)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="closed">Закрытые</option>
              <option value="archived">Архивированные</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <ChatSessionList
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
            onDeleteSession={deleteSession}
          />
        )}
      </div>
      
      {/* Детали сессии и сообщения */}
      <div className="md:col-span-2">
        {selectedSession ? (
          <ChatSessionDetail
            session={selectedSession}
            messages={messages}
            onUpdateTitle={updateSessionTitle}
            onCloseSession={closeSession}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-gray-500">
              <p>Выберите сессию для просмотра сообщений</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}