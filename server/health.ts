import { Express, Response } from 'express';
import { log } from './utils/log.js';

export function mountHealth(app: Express): void {
  log('[Health] Mounted /health', 'info', 'health');

  const setHealthHeaders = (res: Response) => {
    res.header('Cache-Control', 'no-store');
    res.header('Pragma', 'no-cache');
    res.header('Content-Type', 'text/plain; charset=utf-8');
  };

  app.head('/health', (req, res) => {
    setHealthHeaders(res);
    res.status(200).send();
    log('[Health] 200 ok', 'info', 'health');
  });

  app.get('/health', (req, res) => {
    setHealthHeaders(res);
    res.status(200).send('ok');
    log('[Health] 200 ok', 'info', 'health');
  });
}