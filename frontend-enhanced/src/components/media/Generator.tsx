'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
 // removed unused Input import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Image, Video, Loader2 } from 'lucide-react';

interface MediaGeneratorProps {
  onJobCreated?: (payload: { jobId: string; type: 'image' | 'video'; provider: string; prompt: string }) => void;
}

export function Generator({ onJobCreated }: MediaGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('dalle');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Введите описание для генерации');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const endpoint = type === 'image' ? '/api/media/generate/image' : '/api/media/generate/video';
      
      // Получаем JWT токен из localStorage
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          provider: provider,
          options: type === 'image' ? {
            resolution: '1024x1024',
            quality: 'standard'
          } : {
            duration: 10,
            style: 'cinematic'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при генерации медиа');
      }

      const data = await response.json();
      
      if (data.jobId && onJobCreated) {
        onJobCreated({
          jobId: data.jobId,
          type,
          provider,
          prompt: prompt.trim(),
        });
      }

      // Очищаем форму после успешной генерации
      setPrompt('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsGenerating(false);
    }
  };

  const providers = [
    { value: 'dalle', label: 'DALL·E 3' },
    { value: 'imagen', label: 'Imagen 3' },
    { value: 'veo', label: 'Veo (Video)' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'image' ? <Image className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          Генератор {type === 'image' ? 'изображений' : 'видео'}
        </CardTitle>
        <CardDescription>
          Создавайте профессиональный медиа-контент с помощью AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Тип контента
          </label>
          <Select value={type} onValueChange={(value: 'image' | 'video') => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Изображение</SelectItem>
              <SelectItem value="video">Видео</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="provider" className="text-sm font-medium">
            AI Провайдер
          </label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите провайдера" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((prov) => (
                <SelectItem key={prov.value} value={prov.value}>
                  {prov.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="prompt" className="text-sm font-medium">
            Описание
          </label>
          <textarea
            id="prompt"
            placeholder="Опишите, что вы хотите создать..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Описание для генерации"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Генерирую...
            </>
          ) : (
            <>
              {type === 'image' ? <Image className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
              Создать {type === 'image' ? 'изображение' : 'видео'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}