import express from 'express';
import { AGENT_MODEL_OPTIONS, AgentKey } from '../config/llm-config.js';

const router = express.Router();

// GET /api/models?agentKey=<agent>
router.get('/', (req, res) => {
  try {
    const { agentKey } = req.query;

    if (!agentKey || typeof agentKey !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid agentKey parameter' });
    }

    // Validate agentKey
    if (!Object.keys(AGENT_MODEL_OPTIONS).includes(agentKey)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const models = AGENT_MODEL_OPTIONS[agentKey as AgentKey];

    res.json({
      agentKey,
      models
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
