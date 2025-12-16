import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { chatSessions, messages } from '../../shared/schema.js';

// Существующие схемы из drizzle-orm для чат-сессий и сообщений
export const selectChatSessionSchema = createSelectSchema(chatSessions);
export const insertChatSessionSchema = createInsertSchema(chatSessions);

export const selectMessageSchema = createSelectSchema(messages);
export const insertMessageSchema = createInsertSchema(messages);

// Расширенные схемы для API с дополнительными полями
export const ChatSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  agentType: z.string(),
  title: z.string().nullable(),
  createdAt: z.date(),
});

export const CreateChatSessionSchema = insertChatSessionSchema.extend({
  title: z.string().min(1, 'Заголовок сессии не может быть пустым').max(100, 'Заголовок не должен превышать 100 символов').optional(),
  agentType: z.enum(['Chef', 'Accountant', 'Researcher', 'Media', 'Quality'], {
    errorMap: () => ({ message: 'Недопустимый тип агента' }),
  }),
});

export const UpdateChatSessionSchema = z.object({
  title: z.string().min(1, 'Заголовок сессии не может быть пустым').max(100, 'Заголовок не должен превышать 100 символов').optional(),
  agentType: z.enum(['Chef', 'Accountant', 'Researcher', 'Media', 'Quality'], {
    errorMap: () => ({ message: 'Недопустимый тип агента' }),
  }).optional(),
});

// Сообщения с дополнительными полями для API
export const MessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system'], {
    errorMap: () => ({ message: 'Недопустимая роль сообщения' }),
  }),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  
  // Дополнительные поля для API
  intent: z.enum(['cooking', 'finance', 'research', 'media', 'qa']).optional(),
  agent: z.enum(['Chef', 'Accountant', 'Researcher', 'Media', 'Quality']).optional(),
});

export const CreateMessageSchema = insertMessageSchema.extend({
  content: z.string().min(1, 'Сообщение не может быть пустым').max(5000, 'Сообщение слишком длинное'),
  role: z.enum(['user', 'assistant', 'system'], {
    errorMap: () => ({ message: 'Недопустимая роль сообщения' }),
  }),
  
  // Дополнительные поля
  intent: z.enum(['cooking', 'finance', 'research', 'media', 'qa']).optional(),
  agent: z.enum(['Chef', 'Accountant', 'Researcher', 'Media', 'Quality']).optional(),
});

// Схемы для API-запросов и ответов
export const CreateChatHistorySchema = z.object({
  session: CreateChatSessionSchema,
  messages: z.array(CreateMessageSchema),
});

export const ChatHistorySchema = z.object({
  session: ChatSessionSchema,
  messages: z.array(MessageSchema),
});

// Схемы для API-эндпоинтов
export const GetChatHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  agentType: z.enum(['Chef', 'Accountant', 'Researcher', 'Media', 'Quality']).optional(),
});

export const ChatHistoryResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    sessions: z.array(ChatSessionSchema),
    messages: z.record(z.array(MessageSchema)), // messagesBySessionId
    totalSessions: z.number().int(),
    totalMessages: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  }),
});

export const GetChatMessagesQuerySchema = z.object({
  sessionId: z.string().uuid(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
});

export const ChatMessagesResponseSchema = z.object({
  ok: z.boolean(),
  data: z.object({
    session: ChatSessionSchema,
    messages: z.array(MessageSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  }),
});

// Экспортируем типы для использования в коде
export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type CreateChatSession = z.infer<typeof CreateChatSessionSchema>;
export type UpdateChatSession = z.infer<typeof UpdateChatSessionSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type ChatHistory = z.infer<typeof ChatHistorySchema>;
export type CreateChatHistory = z.infer<typeof CreateChatHistorySchema>;