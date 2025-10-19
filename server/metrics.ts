import client from 'prom-client';
import fs from 'fs/promises';
import path from 'path';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'chefs_mind_',
});

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'user_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'user_id'],
  registers: [register],
});

const databaseQueries = new client.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'success'],
  registers: [register],
});

const aiApiCalls = new client.Counter({
  name: 'ai_api_calls_total',
  help: 'Total number of AI API calls',
  labelNames: ['provider', 'model', 'success', 'duration_ms'],
  registers: [register],
});

const backupOperations = new client.Counter({
  name: 'backup_operations_total',
  help: 'Total number of backup operations',
  labelNames: ['operation', 'success', 'size_bytes'],
  registers: [register],
});

// Metrics logging function
async function logMetrics() {
  try {
    const metrics = await register.metrics();
    const logPath = path.join(process.cwd(), 'logs', 'metrics_smoke.json');
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      metrics: metrics,
      system_info: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    // Read existing logs and append new entry
    let existingLogs = [];
    try {
      const existing = await fs.readFile(logPath, 'utf8');
      existingLogs = JSON.parse(existing);
      if (!Array.isArray(existingLogs)) {
        existingLogs = [existingLogs];
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
    }
    
    existingLogs.push(logEntry);
    await fs.writeFile(logPath, JSON.stringify(existingLogs, null, 2));
    
    console.log(`📊 Metrics logged to ${logPath}`);
  } catch (error) {
    console.error('Failed to log metrics:', error);
  }
}

// Export metrics
export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  databaseQueries,
  aiApiCalls,
  backupOperations,
  logMetrics
};

// Metrics endpoint
export function getMetricsHandler() {
  return async (req: any, res: any) => {
    try {
      const metrics = await register.metrics();
      res.set('Content-Type', register.contentType);
      res.end(metrics);
    } catch (error: any) {
      res.status(500).end(error.message);
    }
  };
}

// Mount metrics endpoint
export function mountMetrics(app: any) {
  app.get("/metrics", getMetricsHandler());
}