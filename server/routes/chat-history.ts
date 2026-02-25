import express from 'express';
import { z } from 'zod';
import { dbWrite as db, dbRead } from '../db.js';
import { chatSessions, messages } from '../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { 
  GetChatHistoryQuerySchema, 
  GetChatMessagesQuerySchema, 
  ChatHistoryResponseSchema, 
  ChatMessagesResponseSchema,
  CreateChatSessionSchema,
  UpdateChatSessionSchema 
} from '../schemas/chat.schemas.js';
import { authenticate } from '../middleware/jwtAuth.js';
import { requireRole } from '../middleware/rbac.js';
import { requireWriteConfirm } from '../middleware/safeMode.js';

const router = express.Router();

// Middleware аутентификации для всех маршрутов
router.use(authenticate);

// Применяем middleware для проверки ролей для всех эндпоинтов
router.use(requireRole(['chef', 'accountant', 'admin']));

// GET /api/chat/history - получить список сессий чата пользователя
router.get('/history', async (req, res) => {
  try {
    // Валидация query-параметров
    const queryParams = GetChatHistoryQuerySchema.parse(req.query);
    const { page, limit, agentType } = queryParams;
    const safePage = page ?? 1;
    const safeLimit = limit ?? 10;

    // Получение ID текущего пользователя
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Пользователь не аутентифицирован',
      });
    }
    
    // Формирование условия для запроса
    const conditions = [eq(chatSessions.userId, userId)];
    
    // Добавление фильтра по типу агента, если он указан
    if (agentType) {
      conditions.push(eq(chatSessions.agentType, agentType));
    }
    
    // Получение общего количества сессий
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(chatSessions)
      .where(and(...conditions));
    
    // Вычисление количества записей для пагинации
    const offset = (safePage - 1) * safeLimit;

    // Получение сессий с пагинацией
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(and(...conditions))
      .orderBy(desc(chatSessions.createdAt))
      .limit(safeLimit)
      .offset(offset);
    
    // Для каждой сессии получаем количество сообщений
    const sessionsWithMessageCount = await Promise.all(
      sessions.map(async (session) => {
        const [{ count: messageCount }] = await db
          .select({ count: sql`count(*)` })
          .from(messages)
          .where(eq(messages.sessionId, session.id));
        
        return {
          ...session,
          messageCount: Number(messageCount),
        };
      })
    );
    
    // Формирование ответа
    const response = {
      ok: true,
      data: {
        sessions: sessionsWithMessageCount,
        messages: {}, // Пустой объект, т.к. загружаются по требованию
        totalSessions: Number(count),
        totalMessages: 0, // Будет вычислено при необходимости
        page,
        limit,
      },
    };
    
    // Валидация ответа с помощью Zod
    const validatedResponse = ChatHistoryResponseSchema.parse(response);
    
    // Возврат результата
    res.json(validatedResponse);
  } catch (error) {
    console.error('Ошибка при получении истории чата:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Ошибка валидации параметров запроса',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось получить историю чата. Пожалуйста, попробуйте позже.',
    });
  }
});

// GET /api/chat/history/:sessionId - получить сообщения для конкретной сессии
router.get('/history/:sessionId', async (req, res) => {
  try {
    // Валидация query-параметров
    const queryParams = GetChatMessagesQuerySchema.parse(req.query);
    const { page, limit } = queryParams;
    const safePage2 = page ?? 1;
    const safeLimit2 = limit ?? 10;

    // Получение ID сессии из параметров пути
    const sessionId = req.params.sessionId;
    
    // Валидация ID сессии как UUID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(sessionId);
    
    // Получение ID текущего пользователя
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Пользователь не аутентифицирован',
      });
    }
    
    // Проверка, что сессия принадлежит текущему пользователю
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.userId, userId)
      ));
    
    if (!session) {
      return res.status(404).json({
        ok: false,
        error: 'Сессия не найдена',
        message: 'У вас нет доступа к этой сессии или она не существует',
      });
    }
    
    // Получение общего количества сообщений в сессии
    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(messages)
      .where(eq(messages.sessionId, sessionId));
    
    // Вычисление количества записей для пагинации
    const offset2 = (safePage2 - 1) * safeLimit2;

    // Получение сообщений с пагинацией
    const sessionMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt)
      .limit(safeLimit2)
      .offset(offset2);
    
    // Формирование ответа
    const response = {
      ok: true,
      data: {
        session,
        messages: sessionMessages,
        total: Number(count),
        page,
        limit,
      },
    };
    
    // Валидация ответа с помощью Zod
    const validatedResponse = ChatMessagesResponseSchema.parse(response);
    
    // Возврат результата
    res.json(validatedResponse);
  } catch (error) {
    console.error('Ошибка при получении сообщений чата:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Ошибка валидации параметров запроса',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось получить сообщения чата. Пожалуйста, попробуйте позже.',
    });
  }
});

// POST /api/chat/history - создать новую сессию чата
// Добавляем middleware для проверки подтверждения записи
router.post('/history', requireWriteConfirm, async (req, res) => {
  try {
    // Валидация тела запроса
    const sessionData = CreateChatSessionSchema.parse(req.body);
    
    // Получение ID текущего пользователя
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Пользователь не аутентифицирован',
      });
    }
    
    // Создание новой сессии в базе данных
    const [newSession] = await db
      .insert(chatSessions)
      .values({
        userId,
        agentType: sessionData.agentType,
        title: sessionData.title || 'Новая сессия чата',
      })
      .returning();
    
    // Возврат результата
    res.status(201).json({
      ok: true,
      data: newSession,
    });
  } catch (error) {
    console.error('Ошибка при создании сессии чата:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Ошибка валидации данных',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось создать сессию чата. Пожалуйста, попробуйте позже.',
    });
  }
});

// PUT /api/chat/history/:sessionId - обновить информацию о сессии
// Добавляем middleware для проверки подтверждения записи
router.put('/history/:sessionId', requireWriteConfirm, async (req, res) => {
  try {
    // Валидация ID сессии как UUID
    const uuidSchema = z.string().uuid();
    const sessionId = uuidSchema.parse(req.params.sessionId);
    
    // Валидация тела запроса
    const updateData = UpdateChatSessionSchema.parse(req.body);
    
    // Получение ID текущего пользователя
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Пользователь не аутентифицирован',
      });
    }
    
    // Проверка, что сессия принадлежит текущему пользователю
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.userId, userId)
      ));
    
    if (!session) {
      return res.status(404).json({
        ok: false,
        error: 'Сессия не найдена',
        message: 'У вас нет доступа к этой сессии или она не существует',
      });
    }
    
    // Обновление сессии в базе данных
    const [updatedSession] = await db
      .update(chatSessions)
      .set(updateData)
      .where(eq(chatSessions.id, sessionId))
      .returning();
    
    // Возврат результата
    res.json({
      ok: true,
      data: updatedSession,
    });
  } catch (error) {
    console.error('Ошибка при обновлении сессии чата:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Ошибка валидации данных',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось обновить сессию чата. Пожалуйста, попробуйте позже.',
    });
  }
});

// DELETE /api/chat/history/:sessionId - удалить сессию чата
// Добавляем middleware для проверки подтверждения записи
router.delete('/history/:sessionId', requireWriteConfirm, async (req, res) => {
  try {
    // Валидация ID сессии как UUID
    const uuidSchema = z.string().uuid();
    const sessionId = uuidSchema.parse(req.params.sessionId);
    
    // Получение ID текущего пользователя
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: 'Пользователь не аутентифицирован',
      });
    }
    
    // Проверка, что сессия принадлежит текущему пользователю
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.id, sessionId),
        eq(chatSessions.userId, userId)
      ));
    
    if (!session) {
      return res.status(404).json({
        ok: false,
        error: 'Сессия не найдена',
        message: 'У вас нет доступа к этой сессии или она не существует',
      });
    }
    
    // Удаление сессии (включая все связанные сообщения благодаря CASCADE)
    await db
      .delete(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    
    // Возврат успешного результата
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении сессии чата:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Ошибка валидации параметров запроса',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      ok: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Не удалось удалить сессию чата. Пожалуйста, попробуйте позже.',
    });
  }
});

export default router;