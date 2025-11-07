import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Summary,
} from 'prom-client';

collectDefaultMetrics({ prefix: 'chefs_' });

export const httpRequestsTotal = new Counter({
  name: 'chefs_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status_code'],
});

export const httpLatency = new Histogram({
  name: 'chefs_http_latency_ms',
  help: 'HTTP request latency in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [10, 50, 100, 300, 500, 1000, 3000, 5000, 10000],
});

export const httpLatencySummary = new Summary({
  name: 'chefs_http_latency_summary_ms',
  help: 'HTTP request latency summary in milliseconds',
  labelNames: ['method', 'route', 'status'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  maxAgeSeconds: 300, // 5 minutes
  ageBuckets: 5,
});

export const llmLatency = new Histogram({
  name: 'chefs_llm_latency_ms',
  help: 'LLM call latency in milliseconds',
  labelNames: ['model', 'agent'],
  buckets: [100, 500, 1000, 3000, 5000, 10000, 30000],
});

export const llmLatencySummary = new Summary({
  name: 'chefs_llm_latency_summary_ms',
  help: 'LLM call latency summary in milliseconds',
  labelNames: ['model', 'agent'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  maxAgeSeconds: 600, // 10 minutes
  ageBuckets: 3,
});

export const dbQueryLatency = new Histogram({
  name: 'chefs_db_query_latency_ms',
  help: 'Database query latency in milliseconds',
  labelNames: ['operation', 'table'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500],
});

export const dbQueryLatencySummary = new Summary({
  name: 'chefs_db_query_latency_summary_ms',
  help: 'Database query latency summary in milliseconds',
  labelNames: ['operation', 'table'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  maxAgeSeconds: 300, // 5 minutes
  ageBuckets: 5,
});

export const mediaGenerationLatency = new Histogram({
  name: 'chefs_media_generation_latency_ms',
  help: 'Media generation latency in milliseconds',
  labelNames: ['type', 'provider', 'model'],
  buckets: [1000, 5000, 10000, 30000, 60000, 120000, 300000],
});

export const mediaGenerationLatencySummary = new Summary({
  name: 'chefs_media_generation_latency_summary_ms',
  help: 'Media generation latency summary in milliseconds',
  labelNames: ['type', 'provider', 'model'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  maxAgeSeconds: 600, // 10 minutes
  ageBuckets: 3,
});

export const mediaGenerationErrors = new Counter({
  name: 'chefs_media_generation_errors_total',
  help: 'Total number of media generation errors',
  labelNames: ['type', 'provider', 'model', 'error_type'],
});

export const mediaGenerationRetries = new Counter({
  name: 'chefs_media_generation_retries_total',
  help: 'Total number of media generation retry attempts',
  labelNames: ['type', 'provider', 'model', 'retry_attempt'],
});

export const mediaGenerationFallbacks = new Counter({
  name: 'chefs_media_generation_fallbacks_total',
  help: 'Total number of media generation fallback activations',
  labelNames: ['type', 'from_provider', 'to_provider'],
});

export const backupOperations = new Counter({
  name: 'chefs_backup_operations_total',
  help: 'Total number of backup operations',
  labelNames: ['operation', 'status'],
});

export const backupSize = new Summary({
  name: 'chefs_backup_size_bytes',
  help: 'Backup file size in bytes',
  labelNames: ['type'],
  percentiles: [0.5, 0.9, 0.95, 0.99],
  maxAgeSeconds: 3600, // 1 hour
  ageBuckets: 24,
});

export { register };
