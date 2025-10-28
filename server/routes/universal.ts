import { Router } from 'express';
import { requireRole } from '../middleware/rbac.js';
import { universalAsk } from '../services/universal.js'; 
import { qaGateMiddleware, logQAResult } from '../middleware/qaGate.js';

const router = Router();

// RBAC: Chef доступ к Universal Ask
router.post(
  '/api/universal-ask',
  requireRole(['chef']),
  async (req, res) => {
    try {
      const { role, query, systemPrompt, timeoutMs } = req.body || {};
      if (!role || !query) {
        return res.status(400).json({ success: false, error: 'role and query are required' });
      }

      const result = await universalAsk({ role, query, systemPrompt });

      // QA-Gate для чатоподобных ответов (по CHECKPOINT)
      // Temporarily disabled for testing
      // try {
      //   logQAResult(result, req);
      // } catch (e) {
      //   console.warn('QA Gate logging failed', e);
      // }

      return res.status(200).json(result);
    } catch (err:any) {
      return res.status(500).json({ success: false, error: String(err?.message || err) });
    }
  }
);

// Тестовый маршрут без RBAC для отладки
router.post(
  '/api/universal-ask-test',
  async (req, res) => {
    try {
      const { role, query, systemPrompt, timeoutMs } = req.body || {};
      if (!role || !query) {
        return res.status(400).json({ success: false, error: 'role and query are required' });
      }

      console.log(`[universal-ask-test] Testing with role: ${role}, query: ${query}`);
      const result = await universalAsk({ role, query, systemPrompt });

      // QA-Gate для чатоподобных ответов (по CHECKPOINT)
      // Temporarily disabled for testing
      // try {
      //   logQAResult(result, req);
      // } catch (e) {
      //   console.warn('QA Gate logging failed', e);
      // }

      return res.status(200).json(result);
    } catch (err:any) {
      console.error('[universal-ask-test] Error:', err);
      return res.status(500).json({ success: false, error: String(err?.message || err) });
    }
  }
);

export default router;