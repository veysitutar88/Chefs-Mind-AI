'use client';

import React, { useState } from 'react';
import { RBACGuard } from '../../components/RBACGuard';
import { Generator } from '../../components/media/Generator';
import { JobList } from '../../components/media/JobList';
import { AssetGallery } from '../../components/media/AssetGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Wand2, List, Images } from 'lucide-react';

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

function MediaStudioContent() {
  const [activeJobs, setActiveJobs] = useState<MediaJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<MediaJob[]>([]);

  const handleJobCreated = (jobId: string) => {
    // Создаем новую задачу с начальным статусом
    const newJob: MediaJob = {
      id: jobId,
      type: 'image', // Это будет определено на основе ответа API
      provider: 'dalle',
      prompt: '', // Это будет заполнено на основе ответа API
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    
    setActiveJobs(prev => [...prev, newJob]);
  };

  const handleJobUpdate = (jobId: string, status: MediaJob['status']) => {
    setActiveJobs(prev => {
      const updatedJobs = prev.map(job => {
        if (job.id === jobId) {
          const updatedJob = { ...job, status };
          
          if (status === 'completed' || status === 'failed') {
            // Перемещаем завершенную задачу в список завершенных
            setCompletedJobs(prevCompleted => [
              { ...updatedJob, completedAt: new Date().toISOString() },
              ...prevCompleted.slice(0, 19) // Оставляем только последние 20
            ]);
            return null;
          }
          
          return updatedJob;
        }
        return job;
      });
      
      return updatedJobs.filter(Boolean) as MediaJob[];
    });
  };

  const handleJobDelete = (jobId: string) => {
    setActiveJobs(prev => prev.filter(job => job.id !== jobId));
    setCompletedJobs(prev => prev.filter(job => job.id !== jobId));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#3E6BAA]">Media Studio</h1>
        <p className="text-muted-foreground">
          Создавайте профессиональные изображения и видео с помощью AI. 
          Управляйте всем процессом генерации от идеи до готового результата.
        </p>
      </div>

      {/* Основной интерфейс с вкладками */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Генератор
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Задачи ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Галерея
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Генератор */}
            <div>
              <Generator onJobCreated={handleJobCreated} />
            </div>
            
            {/* Текущие задачи */}
            <div>
              <JobList 
                jobs={activeJobs}
                onJobUpdate={handleJobUpdate}
                onJobDelete={handleJobDelete}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Активные задачи */}
            <div>
              <JobList 
                jobs={activeJobs}
                onJobUpdate={handleJobUpdate}
                onJobDelete={handleJobDelete}
              />
            </div>
            
            {/* Недавно завершенные задачи */}
            <div>
              <JobList 
                jobs={completedJobs.slice(0, 5)} // Показываем только последние 5 завершенных
                onJobUpdate={handleJobUpdate}
                onJobDelete={handleJobDelete}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <AssetGallery />
        </TabsContent>
      </Tabs>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-[#3E6BAA]">{activeJobs.length}</div>
          <div className="text-sm text-muted-foreground">Активных задач</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-[#3E6BAA]">{completedJobs.length}</div>
          <div className="text-sm text-muted-foreground">Завершено сегодня</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-[#3E6BAA]">
            {completedJobs.filter(job => job.type === 'image').length}
          </div>
          <div className="text-sm text-muted-foreground">Изображений создано</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-[#3E6BAA]">
            {completedJobs.filter(job => job.type === 'video').length}
          </div>
          <div className="text-sm text-muted-foreground">Видео создано</div>
        </div>
      </div>
    </div>
  );
}

export default function MediaStudioPage() {
  return (
    <RBACGuard allowedRoles={['admin']}>
      <MediaStudioContent />
    </RBACGuard>
  );
}