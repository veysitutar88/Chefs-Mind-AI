'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { Database, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

type BackupStatus = 'idle' | 'loading' | 'success' | 'error';

interface BackupOperation {
  id: string;
  timestamp: number;
  status: BackupStatus;
  message?: string;
}

export function BackupManager() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('idle');
  const [confirmCode, setConfirmCode] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastOperation, setLastOperation] = useState<BackupOperation | null>(null);

  const createBackup = async () => {
    if (!confirmCode.trim()) {
      setShowConfirmDialog(true);
      return;
    }

    setBackupStatus('loading');
    setShowConfirmDialog(false);
    
    const operation: BackupOperation = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'loading'
    };
    
    setLastOperation(operation);

    try {
      const response = await fetch('/api/db/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Confirm-Code': confirmCode,
        },
        body: JSON.stringify({
          reason: 'manual_backup',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setLastOperation({
        ...operation,
        status: 'success',
        message: data.message || 'Резервная копия успешно создана'
      });
      setBackupStatus('success');
      setConfirmCode('');
    } catch (error) {
      console.error('Error creating backup:', error);
      
      setLastOperation({
        ...operation,
        status: 'error',
        message: error instanceof Error ? error.message : 'Произошла ошибка при создании резервной копии'
      });
      setBackupStatus('error');
      setConfirmCode('');
    }
  };

  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case 'loading':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Управление резервными копиями
        </h1>
        <p className="text-gray-600">
          Создание и управление резервными копиями базы данных
        </p>
      </div>

      {/* Основная карточка управления */}
      <Card className="p-6 bg-white border-2 border-gray-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Создать резервную копию
            </h2>
            <p className="text-gray-600">
              Создайте немедленную резервную копию базы данных
            </p>
          </div>
        </div>

        {/* Кнопка создания бэкапа */}
        <div className="flex gap-4">
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                onClick={() => setShowConfirmDialog(true)}
                disabled={backupStatus === 'loading'}
                className="bg-[#3E6BAA] hover:bg-[#2E5A8A] text-white px-6 py-3 text-lg"
              >
                <Database className="w-5 h-5 mr-2" />
                Создать резервную копию
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  Подтверждение безопасности
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Для создания резервной копии требуется ввод кода подтверждения. 
                  Эта операция требует прав администратора и может занять несколько минут.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <label htmlFor="confirmCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Код подтверждения:
                </label>
                <input
                  id="confirmCode"
                  type="password"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="Введите код подтверждения"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3E6BAA] focus:border-transparent"
                  autoFocus
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmCode('')}>
                  Отмена
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={createBackup}
                  disabled={!confirmCode.trim() || backupStatus === 'loading'}
                  className="bg-[#3E6BAA] hover:bg-[#2E5A8A]"
                >
                  Подтвердить и создать
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {backupStatus === 'loading' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Создание резервной копии...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Статус последней операции */}
      {lastOperation && (
        <Card className={`p-6 border-2 ${getStatusColor(lastOperation.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(lastOperation.status)}
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-800">
                {lastOperation.status === 'loading' && 'Создание резервной копии...'}
                {lastOperation.status === 'success' && 'Резервная копия создана успешно'}
                {lastOperation.status === 'error' && 'Ошибка при создании резервной копии'}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(lastOperation.timestamp).toLocaleString('ru-RU')}
              </p>
              {lastOperation.message && (
                <p className={`text-sm mt-1 ${
                  lastOperation.status === 'success' ? 'text-green-600' : 
                  lastOperation.status === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {lastOperation.message}
                </p>
              )}
            </div>
            {lastOperation.status === 'loading' && (
              <SkeletonLoader className="w-20 h-4" />
            )}
          </div>
        </Card>
      )}

      {/* Информация о системе бэкапов */}
      <Card className="p-6 bg-gray-50 border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Информация о резервном копировании
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Автоматические бэкапы:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Ежедневно в 02:00 UTC</li>
              <li>• Хранение последних 30 дней</li>
              <li>• SHA256 тройная верификация</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Безопасность:</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Обязательный код подтверждения</li>
              <li>• Только для роли администратора</li>
              <li>• Логирование всех операций</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}