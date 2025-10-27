import express from 'express';
import { metricsMiddleware } from './metrics.js';
// при необходимости можно добавить другие middleware здесь

export function applyMiddleware(app: any) {
  app.use(express.json());
  app.use(metricsMiddleware);
  // другие middleware, если нужно, но без шумного логгера для тестов
}