'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface DeleteEventButtonProps {
  eventId: string;
  eventTitle: string;
  onDelete: (eventId: string) => Promise<void>;
  variant?: 'outline' | 'default';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function DeleteEventButton({ 
  eventId, 
  eventTitle, 
  onDelete, 
  variant = 'outline',
  size = 'sm',
  className = ''
}: DeleteEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(eventId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to delete event:', error);
      // Ошибка будет обработана в родительском компоненте
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className={className}
      >
        {loading ? 'Удаление...' : 'Удалить'}
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить событие "{eventTitle}"? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {loading ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}