'use client';

import { useState, useEffect } from 'react';
import { RBACGuard } from '../../../components/RBACGuard';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Calendar, Plus, Settings, CalendarDays } from 'lucide-react';
import { CalendarView } from '../../../components/calendar/CalendarView';
import { EventForm } from '../../../components/calendar/EventForm';
import { DeleteEventButton } from '../../../components/calendar/DeleteEventButton';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
}

function CalendarPageContent() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Загрузка событий
  const loadEvents = async () => {
    try {
      const response = await fetch('/api/calendar/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events.map((event: any) => ({
          id: event.id,
          title: event.summary || '',
          description: event.description || '',
          start: new Date(event.start?.dateTime || event.start?.date || new Date()),
          end: new Date(event.end?.dateTime || event.end?.date || new Date()),
          location: event.location || '',
          attendees: event.attendees?.map((a: any) => a.email) || []
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    }
  };

  // Загрузка событий при монтировании
  useEffect(() => {
    loadEvents();
  }, []);

  // Обработка создания/обновления события
  const handleEventSave = async (eventData: any) => {
    try {
      const url = editingEvent 
        ? `/api/calendar/events/${editingEvent.id}`
        : '/api/calendar/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      // Преобразуем данные формы в формат для API
      const apiData = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.start.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventData.end.toISOString(),
          timeZone: 'UTC'
        },
        location: eventData.location,
        attendees: eventData.attendees?.map((email: string) => ({ email })) || []
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        setShowEventForm(false);
        setEditingEvent(null);
        loadEvents();
        setRefreshKey(prev => prev + 1);
      } else {
        const error = await response.json();
        console.error('Ошибка сохранения события:', error);
        alert('Ошибка при сохранении события: ' + error.error);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при сохранении события');
    }
  };

  // Обработка удаления события
  const handleEventDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadEvents();
        setRefreshKey(prev => prev + 1);
        return true;
      } else {
        const error = await response.json();
        console.error('Ошибка удаления события:', error);
        alert('Ошибка при удалении события: ' + error.error);
        return false;
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при удалении события');
      return false;
    }
  };

  // Обработка редактирования события
  const handleEditEvent = (event: CalendarEvent) => {
    // Преобразуем CalendarEvent в формат для формы (строки в Date)
    const eventForForm = {
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    };
    setEditingEvent(eventForForm);
    setShowEventForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalendarDays className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Управление календарем
            </h1>
          </div>
          <p className="text-gray-600">
            Интеграция с Google Calendar для планирования событий ресторана
          </p>
        </header>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              События сегодня
            </h3>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(event => {
                const today = new Date().toDateString();
                const eventDate = event.start.toDateString();
                return today === eventDate;
              }).length}
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Всего событий
            </h3>
            <div className="text-2xl font-bold text-green-600">
              {events.length}
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Статус синхронизации
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">Синхронизировано</span>
            </div>
          </Card>
        </div>

        {/* Панель управления */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Календарь событий
              </h2>
              <p className="text-gray-600 text-sm">
                Управляйте событиями и встречами вашего ресторана
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Новое событие
              </Button>
              <Button
                onClick={loadEvents}
                variant="outline"
                className="border-gray-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Обновить
              </Button>
            </div>
          </div>
        </Card>

        {/* Календарь */}
        <Card className="p-6">
          <CalendarView
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleEventDelete}
            onCreateEvent={() => {
              setEditingEvent(null);
              setShowEventForm(true);
            }}
            refreshTrigger={refreshKey}
          />
        </Card>

        {/* Форма события */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <EventForm
                event={editingEvent}
                onSave={handleEventSave}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                isOpen={showEventForm}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <RBACGuard requireAdmin={true}>
      <CalendarPageContent />
    </RBACGuard>
  );
}