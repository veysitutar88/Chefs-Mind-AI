import { Router, Request, Response } from 'express';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import { dbWrite, dbRead } from '../db.js';
import { followupTasks } from '../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { scheduleFollowupTask } from '../services/reminder-helpers.js';

const router = Router();

// Middleware for все routes
router.use(jwtAuthMiddleware);
router.use(requireAuth);

// GET /api/followup/tasks - Получить список задач followup
router.get('/tasks', async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const { status, type, limit = '20', offset = '0' } = req.query;

        // Build conditions
        const conditions = [eq(followupTasks.userId, userId)];

        if (status) {
            conditions.push(eq(followupTasks.status, status as string));
        }

        if (type) {
            conditions.push(eq(followupTasks.type, type as string));
        }

        // Get total count
        const [{ count }] = await dbRead
            .select({ count: sql`count(*)` })
            .from(followupTasks)
            .where(and(...conditions));

        // Get tasks
        const tasks = await dbRead
            .select()
            .from(followupTasks)
            .where(and(...conditions))
            .orderBy(desc(followupTasks.dueDate))
            .limit(parseInt(limit as string))
            .offset(parseInt(offset as string));

        res.json({
            success: true,
            tasks,
            total: Number(count),
            page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
            limit: parseInt(limit as string),
        });
    } catch (error) {
        console.error('Error fetching followup tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch followup tasks',
            details: (error as Error).message,
        });
    }
});

// POST /api/followup/tasks - Создать новую задачу followup
router.post('/tasks', async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const schema = z.object({
            type: z.string().min(1),
            relatedEntity: z.string().optional(),
            entityId: z.string().optional(),
            dueDate: z.string(),
            title: z.string().min(1),
            notes: z.string().optional(),
        });

        const data = schema.parse(req.body);

        const taskId = await scheduleFollowupTask({
            userId,
            type: data.type,
            relatedEntity: data.relatedEntity,
            entityId: data.entityId,
            dueDate: new Date(data.dueDate),
            title: data.title,
            notes: data.notes,
        });

        // Fetch created task
        const [task] = await dbRead
            .select()
            .from(followupTasks)
            .where(eq(followupTasks.id, taskId));

        res.status(201).json({
            success: true,
            task,
        });
    } catch (error) {
        console.error('Error creating followup task:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to create followup task',
            details: (error as Error).message,
        });
    }
});

// PATCH /api/followup/tasks/:id - Обновить задачу
router.patch('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const taskId = req.params.id;

        const schema = z.object({
            status: z.enum(['pending', 'completed', 'cancelled']).optional(),
            notes: z.string().optional(),
            dueDate: z.string().optional(),
            title: z.string().optional(),
        });

        const data = schema.parse(req.body);

        // Check ownership
        const [task] = await dbRead
            .select()
            .from(followupTasks)
            .where(and(
                eq(followupTasks.id, taskId),
                eq(followupTasks.userId, userId)
            ));

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
            });
        }

        // Update task
        const updateData: any = { updatedAt: new Date() };
        if (data.status) updateData.status = data.status;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.title) updateData.title = data.title;
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

        const [updatedTask] = await dbWrite
            .update(followupTasks)
            .set(updateData)
            .where(eq(followupTasks.id, taskId))
            .returning();

        res.json({
            success: true,
            task: updatedTask,
        });
    } catch (error) {
        console.error('Error updating followup task:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors,
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to update followup task',
            details: (error as Error).message,
        });
    }
});

// DELETE /api/followup/tasks/:id - Удалить задачу (soft delete)
router.delete('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const taskId = req.params.id;

        // Check ownership
        const [task] = await dbRead
            .select()
            .from(followupTasks)
            .where(and(
                eq(followupTasks.id, taskId),
                eq(followupTasks.userId, userId)
            ));

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
            });
        }

        // Soft delete - mark as cancelled
        await dbWrite
            .update(followupTasks)
            .set({ status: 'cancelled', updatedAt: new Date() })
            .where(eq(followupTasks.id, taskId));

        res.json({
            success: true,
            message: 'Task cancelled',
        });
    } catch (error) {
        console.error('Error deleting followup task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete followup task',
            details: (error as Error).message,
        });
    }
});

export default router;
