import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  const port = process.env.PORT || '5001';
  const videoEnabled = process.env.ENABLE_VIDEO === 'true';
  
  res.json({
    ok: true,
    port: parseInt(port),
    video_enabled: !videoEnabled
  });
});

export default router;
