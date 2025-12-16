'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar-custom.css';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const localizer = momentLocalizer(moment);

interface CalendarEventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}

interface CalendarViewProps {
  onCreateEvent: () => void;
  onEditEvent: (event: CalendarEventData) => void;
  onDeleteEvent: (eventId: string) => void;
  refreshTrigger?: number;
}

export function CalendarView({ onCreateEvent, onEditEvent, onDeleteEvent, refreshTrigger }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/calendar/events`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при получении событий');
      }

      const data = await response.json();
      
      // Преобразуем события из API в формат для react-big-calendar
      const calendarEvents: CalendarEvent[] = data.events.map((event: any) => ({
        id: event.id,
        title: event.summary || 'Без названия',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        resource: event, // Сохраняем полные данные события
      }));

      setEvents(calendarEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const handleSelectEvent = (event: CalendarEvent) => {
    const eventData = event.resource as any;
    onEditEvent({
      id: event.id as string,
      title: event.title,
      start: event.start,
      end: event.end,
      description: eventData.description,
      location: eventData.location,
      attendees: eventData.attendees,
    });
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventData = event.resource as any;
    let backgroundColor = '#3E6BAA'; // основной цвет проекта
    
    // Разные цвета для разных типов событий
    if (eventData.summary?.toLowerCase().includes('платеж')) {
      backgroundColor = '#B79F8C'; // дополнительный цвет
    } else if (eventData.summary?.toLowerCase().includes('доставка')) {
      backgroundColor = '#4CAF50';
    } else if (eventData.summary?.toLowerCase().includes('встреча')) {
      backgroundColor = '#FF9800';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Загрузка календаря...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Ошибка: {error}</p>
            <Button onClick={fetchEvents} variant="outline">
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Календарь событий</CardTitle>
          <Button onClick={onCreateEvent} className="bg-brand-blue hover:bg-brand-blue/90">
            Создать событие
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day', 'agenda']}
            step={30}
            showMultiDayTimes
            messages={{
              allDay: 'Весь день',
              previous: 'Предыдущий',
              next: 'Следующий',
              today: 'Сегодня',
              month: 'Месяц',
              week: 'Неделя',
              day: 'День',
              agenda: 'Повестка',
              date: 'Дата',
              time: 'Время',
              event: 'Событие',
              noEventsInRange: 'В этом диапазоне нет событий',
              showMore: (total) => `+${total} ещё`
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}