'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface CalendarEventData {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}

interface EventFormProps {
  event?: CalendarEventData | null;
  onSave: (event: CalendarEventData) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function EventForm({ event, onSave, onCancel, isOpen }: EventFormProps) {
  const [formData, setFormData] = useState<CalendarEventData>({
    title: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000), // +1 hour
    description: '',
    location: '',
    attendees: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        description: event.description || '',
        location: event.location || '',
        attendees: event.attendees || [],
      });
    } else {
      // Для нового события, устанавливаем время по умолчанию
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Округляем до ближайших 30 минут
      now.setMinutes(now.getMinutes() < 30 ? 0 : 30, 0, 0);
      oneHourLater.setMinutes(oneHourLater.getMinutes() < 30 ? 0 : 30, 0, 0);
      
      setFormData({
        title: '',
        start: now,
        end: oneHourLater,
        description: '',
        location: '',
        attendees: [],
      });
    }
    setError(null);
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Валидация
    if (!formData.title.trim()) {
      setError('Название события обязательно');
      setLoading(false);
      return;
    }

    if (formData.start >= formData.end) {
      setError('Время начала должно быть раньше времени окончания');
      setLoading(false);
      return;
    }

    if (formData.start < new Date()) {
      setError('Время начала не может быть в прошлом');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeChange = (field: 'start' | 'end', value: string) => {
    const date = new Date(value);
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleAttendeesChange = (value: string) => {
    // Разделяем email адреса запятыми
    const attendees = value.split(',').map(email => email.trim()).filter(email => email.length > 0);
    setFormData(prev => ({
      ...prev,
      attendees
    }));
  };

  const formatDateTimeForInput = (date: Date) => {
    // Формат для input type="datetime-local"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {event ? 'Редактировать событие' : 'Создать новое событие'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Название события */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Название события *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введите название события"
                className="w-full"
                required
              />
            </div>

            {/* Описание */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Описание
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание события"
                className="w-full p-2 border border-gray-300 rounded-md h-24 resize-none"
              />
            </div>

            {/* Время начала */}
            <div>
              <label htmlFor="start" className="block text-sm font-medium mb-2">
                Время начала *
              </label>
              <Input
                id="start"
                type="datetime-local"
                value={formatDateTimeForInput(formData.start)}
                onChange={(e) => handleDateTimeChange('start', e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Время окончания */}
            <div>
              <label htmlFor="end" className="block text-sm font-medium mb-2">
                Время окончания *
              </label>
              <Input
                id="end"
                type="datetime-local"
                value={formatDateTimeForInput(formData.end)}
                onChange={(e) => handleDateTimeChange('end', e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Место проведения */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Место проведения
              </label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Адрес или описание места"
                className="w-full"
              />
            </div>

            {/* Участники */}
            <div>
              <label htmlFor="attendees" className="block text-sm font-medium mb-2">
                Участники (email адреса через запятую)
              </label>
              <Input
                id="attendees"
                type="text"
                value={formData.attendees?.join(', ') || ''}
                onChange={(e) => handleAttendeesChange(e.target.value)}
                placeholder="user@example.com, other@example.com"
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Участники получат приглашение на событие
              </p>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-blue hover:bg-brand-blue/90 flex-1"
              >
                {loading ? 'Сохранение...' : (event ? 'Сохранить изменения' : 'Создать событие')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}