"use client";

import { useEffect, useState } from "react";

// Функция для парсинга метрик в формате Prometheus
function parsePrometheusMetrics(metricsText: string) {
  const lines = metricsText.split('\n');
  let httpRequestsTotal = 0;
  let httpRequestDurationP95 = 0;
  let heapSizeUsedBytes = 0;

  for (const line of lines) {
    // Парсим общее количество запросов
    if (line.startsWith('http_requests_total')) {
      const match = line.match(/http_requests_total\s+([0-9.]+)/);
      if (match) {
        httpRequestsTotal = parseFloat(match[1]);
      }
    }
    
    // Парсим p95 задержку
    if (line.includes('http_request_duration_seconds') && line.includes('quantile="0.95"')) {
      const match = line.match(/http_request_duration_seconds\{[^}]*quantile="0.95"[^}]*\}\s+([0-9.]+)/);
      if (match) {
        httpRequestDurationP95 = parseFloat(match[1]) * 1000; // Преобразуем в миллисекунды
      }
    }
    
    // Парсим использование памяти
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
    heapSizeUsedBytes
  };
}

export default function StatusDashboard() {
  const [metrics, setMetrics] = useState({
    httpRequestsTotal: 0,
    httpRequestDurationP95: 0,
    heapSizeUsedBytes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Функция для получения метрик
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/metrics");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const metricsText = await response.text();
        const parsedMetrics = parsePrometheusMetrics(metricsText);
        setMetrics(parsedMetrics);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError("Не удалось получить метрики");
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
  );
}