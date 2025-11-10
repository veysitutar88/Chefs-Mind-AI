import { Router } from 'express';
import { qaGateMiddleware, logQAResult } from '../middleware/qaGate.js';
// ... other imports

const agentChatRouter = Router();

agentChatRouter.post(
  '/',
  qaGateMiddleware, // QA Gate middleware
  async (req, res) => {
    // ... existing logic
    try {
      // ... existing logic
      // After getting a response from the agent
      logQAResult(req, { agentResponse: 'some response' });
      res.json({ response: 'some response', qa: (req as any).qaResult });
    } catch (error) {
      // ... error handling
    }
  }
);

export default agentChatRouter;
