import { Router, Request, Response } from 'express';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import { requireWriteConfirm } from '../middleware/safeMode.js';
import { createEvent, listCalendarEvents, updateCalendarEvent, deleteCalendarEvent, createAdvancedCalendarEvent } from '../services/google-mcp.js';

const router = Router();

// GET /api/calendar/events - Получение списка событий из календаря пользователя
router.get(
  '/events',
  jwtAuthMiddleware,
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userGoogleId = (req.user as any)?.googleId;
      if (!userGoogleId) {
        return res.status(401).json({
          success: false,
          error: 'Google ID not found in user profile',
        });
      }

      const { maxResults, timeMin, timeMax, calendarId } = req.query;

      const events = await listCalendarEvents({
        maxResults: maxResults ? parseInt(maxResults as string) : undefined,
        timeMin: timeMin as string,
        timeMax: timeMax as string,
        calendarId: calendarId as string,
      });

      res.json({
        success: true,
        events,
        count: events.length,
      });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calendar events',
        details: (error as Error).message,
      });
    }
  }
);

// POST /api/calendar/events - Создание нового события в календаре
router.post(
  '/events',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin', 'manager']),
  async (req: Request, res: Response) => {
    try {
      const userGoogleId = (req.user as any)?.googleId;
      if (!userGoogleId) {
        return res.status(401).json({
          success: false,
          error: 'Google ID not found in user profile',
        });
      }

      const { summary, description, startTime, endTime, location, attendees, reminders, calendarId, orderId } = req.body;

      if (!summary || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'summary, startTime, and endTime are required',
        });
      }

      // Валидация дат
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format for startTime or endTime',
        });
      }

      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          error: 'startTime must be before endTime',
        });
      }

      const event = await createAdvancedCalendarEvent({
        summary,
        description,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        location,
        attendees,
        reminders,
        calendarId,
      });

      // Если указан orderId, сохраняем связь в calendar_links
      if (orderId) {
        try {
          const { dbWrite } = await import('../db.js');
          const { calendarLinks } = await import('@shared/schema.js');
          const { v4: uuidv4 } = await import('uuid');

          await dbWrite.insert(calendarLinks).values({
            id: uuidv4(),
            orderId,
            googleEventId: event.id,
            userId: userGoogleId,
            createdAt: new Date(),
          });
        } catch (dbError) {
          console.warn('Failed to save calendar link to database:', dbError);
          // Не блокируем создание события если не удалось сохранить связь
        }
      }

      res.status(201).json({
        success: true,
        event,
        message: 'Calendar event created successfully',
      });
    } catch (error) {
      console.error('Error creating calendar event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create calendar event',
        details: (error as Error).message,
      });
    }
  }
);

// PUT /api/calendar/events/:eventId - Обновление существующего события
router.put(
  '/events/:eventId',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin', 'manager']),
  async (req: Request, res: Response) => {
    try {
      const userGoogleId = (req.user as any)?.googleId;
      if (!userGoogleId) {
        return res.status(401).json({
          success: false,
          error: 'Google ID not found in user profile',
        });
      }

      const { eventId } = req.params;
      const { summary, description, startTime, endTime, location, attendees, calendarId } = req.body;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          error: 'Event ID is required',
        });
      }

      // Валидация дат если они предоставлены
      if (startTime) {
        const startDate = new Date(startTime);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid startTime format',
          });
        }
      }

      if (endTime) {
        const endDate = new Date(endTime);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid endTime format',
          });
        }
      }

      if (startTime && endTime) {
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        if (startDate >= endDate) {
          return res.status(400).json({
            success: false,
            error: 'startTime must be before endTime',
          });
        }
      }

      const updatedEvent = await updateCalendarEvent({
        eventId,
        calendarId,
        summary,
        description,
        startTime,
        endTime,
        location,
        attendees,
      });

      res.json({
        success: true,
        event: updatedEvent,
        message: 'Calendar event updated successfully',
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update calendar event',
        details: (error as Error).message,
      });
    }
  }
);

// DELETE /api/calendar/events/:eventId - Удаление события
router.delete(
  '/events/:eventId',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  async (req: Request, res: Response) => {
    try {
      const userGoogleId = (req.user as any)?.googleId;
      if (!userGoogleId) {
        return res.status(401).json({
          success: false,
          error: 'Google ID not found in user profile',
        });
      }

      const { eventId } = req.params;
      const { calendarId } = req.query;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          error: 'Event ID is required',
        });
      }

      const result = await deleteCalendarEvent(eventId, calendarId as string);

      // Удаляем связь из calendar_links если существует
      try {
        const { dbWrite } = await import('../db.js');
        const { calendarLinks } = await import('@shared/schema.js');

        await dbWrite.delete(calendarLinks)
          .where((calendarLinks.googleEventId.eq(eventId)))
          .and(calendarLinks.userId.eq(userGoogleId));
      } catch (dbError) {
        console.warn('Failed to remove calendar link from database:', dbError);
        // Не блокируем удаление события если не удалось удалить связь
      }

      res.json({
        success: true,
        result,
        message: 'Calendar event deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete calendar event',
        details: (error as Error).message,
      });
    }
  }
);

// Существующие эндпоинты для платежей и доставок
// POST /api/calendar/payment - Создание события о платеже
router.post(
  '/payment',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  async (req: Request, res: Response) => {
    try {
      const { startTime, description } = req.body;

      if (!startTime) {
        return res.status(400).json({
          success: false,
          error: 'startTime is required',
        });
      }

      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startTime format',
        });
      }

      const eventId = await createEvent({
        summary: 'Payment Due',
        startTime: startDate,
        description: description || 'Payment reminder',
      });

      res.json({
        success: true,
        eventId,
        message: 'Payment event created successfully',
      });
    } catch (error) {
      console.error('Error creating payment event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment event',
        details: (error as Error).message,
      });
    }
  }
);

// POST /api/calendar/delivery - Создание события о доставке
router.post(
  '/delivery',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  async (req: Request, res: Response) => {
    try {
      const { startTime, description } = req.body;

      if (!startTime) {
        return res.status(400).json({
          success: false,
          error: 'startTime is required',
        });
      }

      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startTime format',
        });
      }

      const eventId = await createEvent({
        summary: 'Delivery Scheduled',
        startTime: startDate,
        description: description || 'Delivery reminder',
      });

      res.json({
        success: true,
        eventId,
        message: 'Delivery event created successfully',
      });
    } catch (error) {
      console.error('Error creating delivery event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create delivery event',
        details: (error as Error).message,
      });
    }
  }
);

// POST /api/calendar/followup - Создание события для последующего контакта
router.post(
  '/followup',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  async (req: Request, res: Response) => {
    try {
      const { startTime, description } = req.body;

      if (!startTime) {
        return res.status(400).json({
          success: false,
          error: 'startTime is required',
        });
      }

      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startTime format',
        });
      }

      const eventId = await createEvent({
        summary: 'Follow-up Scheduled',
        startTime: startDate,
        description: description || 'Follow-up reminder',
      });

      res.json({
        success: true,
        eventId,
        message: 'Follow-up event created successfully',
      });
    } catch (error) {
      console.error('Error creating followup event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create followup event',
        details: (error as Error).message,
      });
    }
  }
);

export default router;