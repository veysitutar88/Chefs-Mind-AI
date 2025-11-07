import type { Express, Request, Response } from 'express';
import { register } from 'prom-client';
import { jwtAuthMiddleware } from './middleware/jwtAuth.js';
import { apiLimiter, authLimiter } from './config/rateLimit.js';
import authGoogleRouter from './routes/auth.google.js';
import importerRouter from './routes/importer.js';
import dbadminRouter from './routes/dbadmin.js';
import enhancedAgentChatRouter from './routes/enhanced-agent-chat.js';
import agentChatRouter from './routes/agent-chat.js';
import smokeHelpersRouter from './routes/smoke-helpers.js';
import universalRouter from './routes/universal.js';
import mediaRouter from './routes/media.js';
import calendarRouter from './routes/calendar.js';
import modelsRouter from './routes/models.js';
import reportsRouter from './routes/reports.js';
import { users } from '@shared/schema';

export async function registerRoutes(app: Express) {
  // Сделаем функцию асинхронной

  // Health check endpoint for external monitoring/LB checks (standard path)
  app.get('/health', async (req: Request, res: Response) => {
    res.json({ ok: true, uptime: process.uptime(), ts: Date.now() });
  });

  // Internal API health endpoint (backward compatibility)
  app.get('/api/health', async (req: Request, res: Response) => {
    res.json({ ok: true, uptime: process.uptime(), ts: Date.now() });
  });

  // Prometheus metrics endpoint
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });

  // Apply rate limiting
  app.use('/api/', apiLimiter);
  app.use('/auth/', authLimiter);

  // Apply JWT authentication middleware globally (but don't require auth for all routes)
  app.use(jwtAuthMiddleware);

  // Rate limiting
  app.use('/api/', apiLimiter);
  app.use('/auth/', authLimiter);

  // Additional routes
  app.use('/auth/google', authGoogleRouter);
  app.use('/api/import', importerRouter);
  app.use('/api/dbadmin', dbadminRouter);
  app.use('/api/enhanced-agent-chat', enhancedAgentChatRouter);
  // Backward compatibility alias
  app.use('/api/enhanced-agent/chat', enhancedAgentChatRouter);
  app.use('/api/agent', agentChatRouter);
  app.use('/api/media', mediaRouter);
  app.use('/api/calendar', calendarRouter);
  app.use('/api/models', modelsRouter);
  app.use('/', smokeHelpersRouter);
  app.use('/reports', reportsRouter);
  app.use('/', universalRouter);

  // Basic API routes for testing
  app.get('/api/test', (req: Request, res: Response) => {
    res.json({
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
    });
  });

  // Database test endpoint (to generate DB traffic)
  app.get('/api/test/db', async (req: Request, res: Response) => {
    try {
      // Lazy-load DB only when this route is hit to avoid env requirements in tests
      const { dbRead } = await import('./db.js');
      // Simple DB query to test latency - query users table directly
      const result = await dbRead.select().from(users).limit(1);

      res.json({
        message: 'DB test successful',
        userCount: result.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: 'DB test failed',
        message: (error as Error).message || 'Unknown error',
      });
    }
  });
}
