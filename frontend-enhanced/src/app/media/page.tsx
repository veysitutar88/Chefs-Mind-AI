'use client';

import React, { useState, useEffect } from 'react';
import {
  Image,
  Video,
  Wand2,
  AlertTriangle,
  User,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { RBACGuard } from '../../components/RBACGuard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001';

// Типы для Media API
interface MediaGenerationParams {
  prompt: string;
  generator?: string;
  negativePrompt?: string;
  durationSec?: number;
}

interface MediaGenerationResult {
  success: boolean;
  data: {
    url: string;
    model: string;
    metadata: any;
    fallbackUsed?: boolean;
  };
  qaScore?: number;
  qaPassed?: boolean;
  error?: string;
  message?: string;
}

// Поддерживаемые генераторы
const IMAGE_GENERATORS = [
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'Высококачественные изображения',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    description: 'Художественные изображения',
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    provider: 'Stability AI',
    description: 'Быстрая генерация',
  },
];

const VIDEO_GENERATORS = [
  {
    id: 'veo-3',
    name: 'Veo-3',
    provider: 'Google',
    description: 'Короткие видео до 10 сек',
  },
  {
    id: 'runway',
    name: 'Runway',
    provider: 'Runway',
    description: 'Профессиональные видео',
  },
  {
    id: 'pika',
    name: 'Pika',
    provider: 'Pika Labs',
    description: 'Творческие видео',
  },
];

export default function Media() {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generator, setGenerator] = useState('dall-e-3');
  const [durationSec, setDurationSec] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MediaGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Обновляем генератор при смене типа медиа
  useEffect(() => {
    if (mediaType === 'image') {
      setGenerator('dall-e-3');
    } else {
      setGenerator('veo-3');
    }
  }, [mediaType]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Пожалуйста, введите описание для генерации');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const params: MediaGenerationParams = {
        prompt: prompt.trim(),
        generator,
        negativePrompt: negativePrompt.trim() || undefined,
      };

      if (mediaType === 'video') {
        params.durationSec = durationSec;
      }

      const endpoint =
        mediaType === 'image'
          ? '/api/media/image/generate'
          : '/api/media/video/generate';

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Добавляем заголовки для аутентификации
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(params),
      });

      const data: MediaGenerationResult = await response.json();

      if (!response.ok) {
        // Обработка RBAC ошибок
        if (response.status === 401) {
          setError('Требуется аутентификация. Пожалуйста, войдите в систему.');
        } else if (response.status === 403) {
          setError('Недостаточно прав доступа. Требуется роль admin или chef.');
        } else {
          setError(
            data.message || data.error || 'Произошла ошибка при генерации'
          );
        }
        return;
      }

      setResult(data);
    } catch (err) {
      console.error('Media generation error:', err);
      setError('Сетевая ошибка. Проверьте подключение к серверу.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentGenerators =
    mediaType === 'image' ? IMAGE_GENERATORS : VIDEO_GENERATORS;
  const selectedGenerator = currentGenerators.find(g => g.id === generator);

  return (
    <RBACGuard allowedRoles={['admin', 'chef']}>
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Заголовок */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Wand2 className="w-8 h-8 text-indigo-600" />
              Медиа Студия
            </h1>
            <p className="text-slate-600">
              Создавайте изображения и видео с помощью ИИ для вашего ресторана
            </p>
          </div>

          {/* RBAC информация */}
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">
                  Доступ ограничен
                </h3>
                <p className="text-amber-800 text-sm">
                  Генерация медиа доступна только пользователям с ролями admin
                  или chef. Вам необходима аутентификация для использования
                  данного функционала.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Форма генерации */}
            <div className="space-y-6">
              {/* Выбор типа медиа */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Тип медиа
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMediaType('image')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      mediaType === 'image'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Image className="w-6 h-6 text-indigo-600" />
                      <div>
                        <div className="font-medium text-slate-900">
                          Изображение
                        </div>
                        <div className="text-sm text-slate-600">
                          Фото и иллюстрации
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setMediaType('video')}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      mediaType === 'video'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Video className="w-6 h-6 text-amber-600" />
                      <div>
                        <div className="font-medium text-slate-900">Видео</div>
                        <div className="text-sm text-slate-600">
                          Короткие ролики
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Форма параметров */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Параметры генерации
                </h2>

                {/* Prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Описание <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                    placeholder={`Опишите ${mediaType === 'image' ? 'изображение' : 'видео'}, которое хотите создать...`}
                  />
                </div>

                {/* Negative prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Что исключить
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={e => setNegativePrompt(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Что не должно быть в результате..."
                  />
                </div>

                {/* Генератор */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Генератор
                  </label>
                  <select
                    value={generator}
                    onChange={e => setGenerator(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {currentGenerators.map(gen => (
                      <option key={gen.id} value={gen.id}>
                        {gen.name} ({gen.provider})
                      </option>
                    ))}
                  </select>
                  {selectedGenerator && (
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedGenerator.description}
                    </p>
                  )}
                </div>

                {/* Длительность для видео */}
                {mediaType === 'video' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Длительность (секунды)
                    </label>
                    <input
                      type="number"
                      value={durationSec}
                      onChange={e =>
                        setDurationSec(parseInt(e.target.value) || 10)
                      }
                      min="1"
                      max="30"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Кнопка генерации */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Генерирую {mediaType}...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Создать {mediaType === 'image' ? 'изображение' : 'видео'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Область результата */}
            <div className="space-y-6">
              {/* Ошибка */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">
                        Ошибка
                      </h3>
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Результат */}
              {result && result.success && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Результат генерации
                  </h2>

                  {/* Превью медиа */}
                  <div className="mb-4 bg-slate-100 rounded-lg p-4 text-center">
                    {mediaType === 'image' ? (
                      <img
                        src={result.data.url}
                        alt="Сгенерированное изображение"
                        className="max-w-full h-auto rounded-lg shadow-sm"
                        onError={e => {
                          console.error('Image load error:', e);
                          setError('Не удалось загрузить изображение');
                        }}
                      />
                    ) : (
                      <video
                        src={result.data.url}
                        controls
                        className="max-w-full h-auto rounded-lg shadow-sm"
                        onError={e => {
                          console.error('Video load error:', e);
                          setError('Не удалось загрузить видео');
                        }}
                      >
                        Ваш браузер не поддерживает воспроизведение видео.
                      </video>
                    )}
                  </div>

                  {/* Метаданные */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Модель:</span>
                      <span className="font-medium">{result.data.model}</span>
                    </div>
                    {result.data.fallbackUsed && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fallback:</span>
                        <span className="text-amber-600">Использован</span>
                      </div>
                    )}
                    {result.qaScore !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">QA Score:</span>
                        <span
                          className={
                            result.qaPassed
                              ? 'text-green-600'
                              : 'text-amber-600'
                          }
                        >
                          {result.qaScore.toFixed(1)}{' '}
                          {result.qaPassed ? '✓' : '⚠'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Кнопка скачивания */}
                  <a
                    href={result.data.url}
                    download={`generated-${mediaType}-${Date.now()}.${mediaType === 'image' ? 'jpg' : 'mp4'}`}
                    className="mt-4 w-full bg-slate-600 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Скачать
                  </a>
                </div>
              )}

              {/* Информационная панель */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">
                      Генерация медиа
                    </h3>
                    <p className="text-indigo-700 text-sm leading-relaxed">
                      Используйте описательные промпты для лучших результатов.
                      Указывайте стиль, настроение, композицию и детали. Для
                      ресторанного контента рекомендуется упоминать блюда,
                      атмосферу и стиль обслуживания.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RBACGuard>
  );
}
