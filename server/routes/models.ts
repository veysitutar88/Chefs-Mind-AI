import { Router } from 'express';
import { MODEL_REGISTRY } from '../config/models.js';

const router = Router();

/**
 * GET /api/models
 * Возвращает список доступных моделей для UI ModelPicker.
 * Только безопасные поля: id, name, provider.
 */
router.get('/', (_req, res) => {
  try {
    const list = Object.values(MODEL_REGISTRY).map(m => ({
      id: m.id,
      name: m.name,
      provider: m.provider,
    }));
    res.status(200).json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load models', message: String(err?.message || err) });
  }
});

export default router;