'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface MediaJob {
  id: string;
  type: 'image' | 'video';
  provider: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
  resultUrl?: string;
}

interface JobListProps {
  jobs?: MediaJob[];
  onJobUpdate?: (jobId: string, status: MediaJob['status']) => void;
  onJobDelete?: (jobId: string) => void;
}

export function JobList({ jobs = [], onJobUpdate, onJobDelete }: JobListProps) {
  const [localJobs, setLocalJobs] = useState<MediaJob[]>(jobs);
  const [refreshing, setRefreshing] = useState<Set<string>>(new Set());

  // Обновляем локальные задачи при изменении пропсов
  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  // Периодически обновляем статус задач
  useEffect(() => {
    const activeJobs = localJobs.filter(job => 
      job.status === 'pending' || job.status === 'processing'
    );

    if (activeJobs.length === 0) return;

    const interval = setInterval(() => {
      activeJobs.forEach(async (job) => {
        await refreshJobStatus(job.id);
      });
    }, 5000); // Обновляем каждые 5 секунд

    return () => clearInterval(interval);
  }, [localJobs]);

  const refreshJobStatus = async (jobId: string) => {
    if (refreshing.has(jobId)) return;
    
    setRefreshing(prev => new Set(prev).add(jobId));

    try {
      const response = await fetch(`/api/media/jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Ошибка при получении статуса задачи');
      }

      const jobData = await response.json();
      
      setLocalJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, ...jobData, status: jobData.status }
            : job
        )
      );

      if (onJobUpdate) {
        onJobUpdate(jobId, jobData.status);
      }

    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    } finally {
      setRefreshing(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      setLocalJobs(prev => prev.filter(job => job.id !== jobId));
      
      if (onJobDelete) {
        onJobDelete(jobId);
      }
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
    }
  };

  const getStatusIcon = (status: MediaJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: MediaJob['status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'processing':
        return 'Обрабатывается';
      case 'completed':
        return 'Готово';
      case 'failed':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: MediaJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (localJobs.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Активные задачи</CardTitle>
          <CardDescription>
            Здесь будут отображаться запущенные задачи генерации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Нет активных задач. Создайте новую задачу для начала работы.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Активные задачи ({localJobs.length})</CardTitle>
        <CardDescription>
          Отслеживание прогресса генерации медиа-контента
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {localJobs.map((job) => (
          <div
            key={job.id}
            className="border rounded-lg p-4 space-y-3 bg-background hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                <Badge variant="secondary" className={getStatusColor(job.status)}>
                  {getStatusText(job.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {job.type === 'image' ? 'Изображение' : 'Видео'} • {job.provider}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshJobStatus(job.id)}
                  disabled={refreshing.has(job.id)}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw 
                    className={`h-3 w-3 ${refreshing.has(job.id) ? 'animate-spin' : ''}`} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteJob(job.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{job.prompt}</p>
              
              {job.status === 'processing' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Прогресс</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              )}

              {job.status === 'failed' && job.error && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {job.error}
                </p>
              )}

              {job.status === 'completed' && job.resultUrl && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={job.resultUrl} target="_blank" rel="noopener noreferrer">
                      Посмотреть результат
                    </a>
                  </Button>
                </div>
              )}

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Создано: {formatDate(job.createdAt)}</span>
                {job.completedAt && (
                  <span>Завершено: {formatDate(job.completedAt)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}