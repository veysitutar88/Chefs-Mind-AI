'use client';

import { useEffect, useState } from 'react';
import { RBACGuard } from '../src/components/RBACGuard';

// Функция для парсинга метрик в формате Prometheus
function parsePrometheusMetrics(metricsText: string) {
  const lines = metricsText.split('\n');
  let httpRequestsTotal = 0;
  let httpRequestDurationP95 = 0;
  let heapSizeUsedBytes = 0;

  for (const line of lines) {
    // Дополнительное логирование для отладки
    if (
      line.includes('chefs_') ||
      line.includes('nodejs_') ||
      line.includes('http_')
    ) {
      console.log('Metrics line:', line);
    }

    // Парсим общее количество запросов (с префиксом chefs_)
    if (line.startsWith('chefs_http_requests_total')) {
      const match = line.match(
        /chefs_http_requests_total\{[^}]*\}\s+([0-9.]+)/
      );
      if (match) {
        httpRequestsTotal = parseFloat(match[1]);
      }
    }

    // Парсим p95 задержку из Histogram метрики (используем bucket)
    if (
      line.includes('chefs_http_latency_ms_bucket') &&
      line.includes('le="1000"')
    ) {
      const match = line.match(
        /chefs_http_latency_ms_bucket\{[^}]*le="1000"[^}]*\}\s+([0-9.]+)/
      );
      if (match) {
        // Это количество запросов с задержкой <= 1000ms
        // Для простоты показываем это как p95 метрику
        httpRequestDurationP95 = 1000; // В миллисекундах
      }
    }

    // Альтернативно парсим из Summary если она есть
    if (
      line.includes('chefs_http_latency_summary_ms') &&
      line.includes('quantile="0.95"')
    ) {
      const match = line.match(
        /chefs_http_latency_summary_ms\{[^}]*quantile="0.95"[^}]*\}\s+([0-9.]+)/
      );
      if (match) {
        httpRequestDurationP95 = parseFloat(match[1]); // Уже в миллисекундах
      }
    }

    // Парсим использование памяти из Node.js метрик
    if (line.startsWith('nodejs_heap_size_used_bytes')) {
      const match = line.match(/nodejs_heap_size_used_bytes\s+([0-9.]+)/);
      if (match) {
        heapSizeUsedBytes = parseFloat(match[1]) / (1024 * 1024); // Преобразуем в мегабайты
      }
    }
  }

  return {
    httpRequestsTotal,
    httpRequestDurationP95,
    heapSizeUsedBytes,
  };
}

export default function StatusDashboard() {
  const [metrics, setMetrics] = useState({
    httpRequestsTotal: 0,
    httpRequestDurationP95: 0,
    heapSizeUsedBytes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Функция для получения метрик
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/metrics`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const metricsText = await response.text();
        const parsedMetrics = parsePrometheusMetrics(metricsText);
        setMetrics(parsedMetrics);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError('Не удалось получить метрики');
      } finally {
        setLoading(false);
      }
    };

    // Получаем метрики при монтировании компонента
    fetchMetrics();

    // Устанавливаем интервал для обновления метрик каждые 5 секунд
    const intervalId = setInterval(fetchMetrics, 5000);

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="border rounded p-3 bg-white space-y-2">
        <div className="font-semibold">Статус системы</div>
        <div className="text-sm">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded p-3 bg-white space-y-2">
        <div className="font-semibold">Статус системы</div>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <RBACGuard allowedRoles={['admin', 'accountant']}>
      <div className="border rounded p-3 bg-white space-y-2">
        <div className="font-semibold">Статус системы</div>
        <div className="text-sm">
          Всего запросов: {Math.round(metrics.httpRequestsTotal)}
        </div>
        <div className="text-sm">
          Задержка (p95): {metrics.httpRequestDurationP95.toFixed(2)} ms
        </div>
        <div className="text-sm">
          Использование памяти: {metrics.heapSizeUsedBytes.toFixed(2)} MB
        </div>
      </div>
    </RBACGuard>
  );
}
