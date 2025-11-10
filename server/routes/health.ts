import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: "Chef's Mind AI",
    timestamp: new Date().toISOString(),
  });
});

export default router;
