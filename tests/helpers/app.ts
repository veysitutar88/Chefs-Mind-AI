import express from 'express';
import { applyMiddleware } from '../../server/middleware/index.js';
import { registerRoutes } from '../../server/routes.js';

export function createTestApp() {
  const app = express();
  applyMiddleware(app);
  registerRoutes(app);
  return app;
}
