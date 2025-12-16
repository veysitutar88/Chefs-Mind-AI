import { Router, Request, Response } from 'express';
import { dbRead } from '../db.js';
import { followupTasks } from '../../shared/schema.js';
import { desc } from 'drizzle-orm';

const router = Router();

// GET /api/followups/debug
router.get('/', async (req: Request, res: Response) => {
    try {
        const items = await dbRead
            .select()
            .from(followupTasks)
            .orderBy(desc(followupTasks.createdAt))
            .limit(10);

        res.json({
            ok: true,
            items,
        });
    } catch (error) {
        console.error('Error in followups debug endpoint:', error);
        res.status(500).json({
            ok: false,
            error: 'internal_error',
        });
    }
});

export default router;
