import { describe, test, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import {
  GetChatHistoryQuerySchema,
  GetChatMessagesQuerySchema,
  ChatHistoryResponseSchema,
  ChatMessagesResponseSchema,
  CreateChatSessionSchema,
  UpdateChatSessionSchema
} from '../schemas/chat.schemas';
import chatRouter from '../routes/chat-history';
import { dbWrite as db } from '../db';
import { chatSessions, messages } from '../../shared/schema';

// Mock DB operations
vi.mock('../db', () => {
  return {
    dbWrite: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      $count: vi.fn(),
    },
  };
});

// Mock middleware
vi.mock('../middleware/jwtAuth', () => {
  return {
    authenticate: vi.fn((req, res, next) => {
      req.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
      next();
    }),
  };
});

vi.mock('../middleware/rbac', () => {
  return {
    requireRole: vi.fn(() => (req, res, next) => next()),
  };
});

vi.mock('../middleware/safeMode', () => {
  return {
    requireWriteConfirm: vi.fn(() => (req, res, next) => next()),
  };
});

// Mock shared schema
vi.mock('../../shared/schema', () => {
  const chatSessions = {
    userId: 'users',
    agentType: 'agent_type',
    title: 'title',
    createdAt: 'created_at',
  };
  
  const messages = {
    sessionId: 'session_id',
    createdAt: 'created_at',
  };
  
  return { chatSessions, messages };
});

// Setup Express app with the router
const app = express();
app.use(express.json());
app.use('/api/chat/history', chatRouter);

// Test user
const testUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
};

// Test session
const testSession = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  userId: testUser.id,
  agentType: 'chef',
  title: 'Test Session',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Test message
const testMessage = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  sessionId: testSession.id,
  role: 'user',
  content: 'Test message',
  createdAt: new Date(),
};

describe('Chat History API Tests', () => {
  // Create an Express Request mock for testing
  const createMockRequest = (overrides = {}) => {
    return {
      query: {},
      params: {},
      body: {},
      user: testUser,
      ...overrides,
    };
  };

  const createMockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnThis();
    res.json = vi.fn().mockReturnThis();
    res.send = vi.fn().mockReturnThis();
    return res;
  };

  // Tests for Zod Schemas
  describe('Zod Schema Validation', () => {
    describe('GetChatHistoryQuerySchema', () => {
      test('should validate valid query params', () => {
        const validParams = {
          page: 1,
          limit: 10,
          agentType: 'chef',
        };

        expect(() => GetChatHistoryQuerySchema.parse(validParams)).not.toThrow();
      });

      test('should validate query params with defaults', () => {
        const paramsWithDefaults = {};
        const parsed = GetChatHistoryQuerySchema.parse(paramsWithDefaults);
        
        expect(parsed).toEqual({
          page: 1,
          limit: 10,
          agentType: undefined,
        });
      });

      test('should reject invalid query params', () => {
        const invalidParams = {
          page: 'invalid',
          limit: -1,
          agentType: 123,
        };

        expect(() => GetChatHistoryQuerySchema.parse(invalidParams)).toThrow();
      });
    });

    describe('GetChatMessagesQuerySchema', () => {
      test('should validate valid query params', () => {
        const validParams = {
          page: 1,
          limit: 20,
        };

        expect(() => GetChatMessagesQuerySchema.parse(validParams)).not.toThrow();
      });

      test('should validate query params with defaults', () => {
        const paramsWithDefaults = {};
        const parsed = GetChatMessagesQuerySchema.parse(paramsWithDefaults);
        
        expect(parsed).toEqual({
          page: 1,
          limit: 20,
        });
      });

      test('should reject invalid query params', () => {
        const invalidParams = {
          page: 'invalid',
          limit: 0,
        };

        expect(() => GetChatMessagesQuerySchema.parse(invalidParams)).toThrow();
      });
    });

    describe('CreateChatSessionSchema', () => {
      test('should validate valid session data', () => {
        const validSession = {
          agentType: 'chef',
          title: 'New Session',
        };

        expect(() => CreateChatSessionSchema.parse(validSession)).not.toThrow();
      });

      test('should validate session with only required fields', () => {
        const sessionWithDefaults = {
          agentType: 'accountant',
        };

        const parsed = CreateChatSessionSchema.parse(sessionWithDefaults);
        expect(parsed).toEqual(sessionWithDefaults);
      });

      test('should reject invalid session data', () => {
        const invalidSession = {
          agentType: 'invalid_agent',
          title: 123,
        };

        expect(() => CreateChatSessionSchema.parse(invalidSession)).toThrow();
      });
    });

    describe('UpdateChatSessionSchema', () => {
      test('should validate valid update data', () => {
        const validUpdate = {
          title: 'Updated Title',
        };

        expect(() => UpdateChatSessionSchema.parse(validUpdate)).not.toThrow();
      });

      test('should validate empty update object', () => {
        const emptyUpdate = {};
        
        const parsed = UpdateChatSessionSchema.parse(emptyUpdate);
        expect(parsed).toEqual(emptyUpdate);
      });

      test('should reject invalid update data', () => {
        const invalidUpdate = {
          agentType: 123,
        };

        expect(() => UpdateChatSessionSchema.parse(invalidUpdate)).toThrow();
      });
    });

    describe('Response Schemas', () => {
      test('should validate ChatHistoryResponseSchema', () => {
        const validHistoryResponse = {
          ok: true,
          data: {
            sessions: [testSession],
            messages: {},
            totalSessions: 1,
            totalMessages: 0,
            page: 1,
            limit: 10,
          },
        };

        expect(() => ChatHistoryResponseSchema.parse(validHistoryResponse)).not.toThrow();
      });

      test('should validate ChatMessagesResponseSchema', () => {
        const validMessagesResponse = {
          ok: true,
          data: {
            session: testSession,
            messages: [testMessage],
            total: 1,
            page: 1,
            limit: 20,
          },
        };

        expect(() => ChatMessagesResponseSchema.parse(validMessagesResponse)).not.toThrow();
      });
    });
  });

  // Tests for API Endpoints
  describe('API Endpoints', () => {
    let req, res;

    beforeEach(() => {
      vi.clearAllMocks();
      req = createMockRequest();
      res = createMockResponse();
    });

    describe('GET /api/chat/history', () => {
      test('should return chat sessions with pagination', async () => {
        // Mock DB responses
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          offset: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([testSession]),
        });
        
        // Mock the count query
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue([{ count: 1 }]),
          }),
        });

        // Execute the route handler
        const handler = chatRouter.stack.find(layer => 
          layer.route.path === '/history' && layer.route.methods.get
        );
        
        // Use app to properly handle the request
        const response = await request(app).get('/api/chat/history');

        // Verify the response
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.data.sessions).toEqual([testSession]);
      });

      test('should filter by agent type when provided', async () => {
        req.query = { agentType: 'chef' };
        
        // Mock DB responses
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          offset: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([testSession]),
        });
        
        // Mock the count query
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue([{ count: 1 }]),
          }),
        });

        // Execute the route handler
        const handler = chatRouter.stack.find(layer => 
          layer.route.path === '/history' && layer.route.methods.get
        );
        
        // Use app to properly handle the request
        const response = await request(app).get('/api/chat/history?agentType=chef');

        // Verify that the agent type filter was applied
        expect(db.select().from).toHaveBeenCalledWith(chatSessions);
      });

      test('should handle database errors', async () => {
        // Mock DB error
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockImplementation(() => {
            throw new Error('Database error');
          }),
        });

        // Use app to properly handle the request
        const response = await request(app).get('/api/chat/history');

        // Verify error handling
        expect(response.status).toBe(500);
        expect(response.body.ok).toBe(false);
        expect(response.body.error).toContain('Внутренняя ошибка сервера');
      });
    });

    describe('GET /api/chat/history/:sessionId', () => {
      test('should return session messages with pagination', async () => {
        req.params.sessionId = testSession.id;
        
        // Mock DB responses
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        }).mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          offset: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValueOnce({
          select: vi.fn().mockReturnValue([testSession]),
        }).mockReturnValueOnce({
          select: vi.fn().mockReturnValue([testMessage]),
        });
        
        // Mock the count query
        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue([{ count: 1 }]),
          }),
        });

        // Execute the route handler
        const handler = chatRouter.stack.find(layer => 
          layer.route.path === '/history/:sessionId' && layer.route.methods.get
        );
        
        // Use app to properly handle the request
        const response = await request(app).get(`/api/chat/history/${testSession.id}`);

        // Verify the response
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.data.session).toEqual(testSession);
        expect(response.body.data.messages).toEqual([testMessage]);
      });

      test('should return 404 if session not found', async () => {
        req.params.sessionId = '999e4567-e89b-12d3-a456-426614174999';
        
        // Mock empty session response
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([]),
        });

        // Use app to properly handle the request
        const response = await request(app).get('/api/chat/history/999e4567-e89b-12d3-a456-426614174999');

        // Verify 404 response
        expect(response.status).toBe(404);
        expect(response.body.ok).toBe(false);
        expect(response.body.error).toBe('Сессия не найдена');
      });

      test('should reject invalid UUID format', async () => {
        req.params.sessionId = 'invalid-uuid';
        
        // Use app to properly handle the request
        const response = await request(app).get('/api/chat/history/invalid-uuid');

        // Verify 400 response
        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(response.body.error).toContain('Ошибка валидации параметров запроса');
      });
    });

    describe('POST /api/chat/history', () => {
      test('should create a new session', async () => {
        req.body = { agentType: 'chef', title: 'New Session' };
        
        // Mock DB insert
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockReturnValue([testSession]),
        });

        // Use app to properly handle the request
        const response = await request(app).post('/api/chat/history')
          .send({ agentType: 'chef', title: 'New Session' });

        // Verify the response
        expect(response.status).toBe(201);
        expect(response.body.ok).toBe(true);
        expect(response.body.data).toEqual(testSession);
      });

      test('should use default title if not provided', async () => {
        req.body = { agentType: 'chef' };
        
        // Mock DB insert
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockReturnValue([{ ...testSession, title: 'Новая сессия чата' }]),
        });

        // Use app to properly handle the request
        const response = await request(app).post('/api/chat/history')
          .send({ agentType: 'chef' });

        // Verify the response
        expect(response.status).toBe(201);
        expect(response.body.ok).toBe(true);
      });

      test('should validate request body', async () => {
        // Use app to properly handle the request
        const response = await request(app).post('/api/chat/history')
          .send({ agentType: 'invalid_agent', title: 123 });

        // Verify 400 response
        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);
        expect(response.body.error).toBe('Ошибка валидации данных');
      });
    });

    describe('PUT /api/chat/history/:sessionId', () => {
      test('should update an existing session', async () => {
        req.params.sessionId = testSession.id;
        req.body = { title: 'Updated Session' };
        
        // Mock DB select
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([testSession]),
        });
        
        // Mock DB update
        vi.mocked(db.update).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockReturnValue([{ ...testSession, title: 'Updated Session' }]),
        });

        // Use app to properly handle the request
        const response = await request(app).put(`/api/chat/history/${testSession.id}`)
          .send({ title: 'Updated Session' });

        // Verify the response
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.data.title).toBe('Updated Session');
      });

      test('should return 404 if session not found', async () => {
        req.params.sessionId = '999e4567-e89b-12d3-a456-426614174999';
        req.body = { title: 'Updated Session' };
        
        // Mock empty session response
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([]),
        });

        // Use app to properly handle the request
        const response = await request(app).put('/api/chat/history/999e4567-e89b-12d3-a456-426614174999')
          .send({ title: 'Updated Session' });

        // Verify 404 response
        expect(response.status).toBe(404);
        expect(response.body.ok).toBe(false);
        expect(response.body.error).toBe('Сессия не найдена');
      });
    });

    describe('DELETE /api/chat/history/:sessionId', () => {
      test('should delete an existing session', async () => {
        req.params.sessionId = testSession.id;
        
        // Mock DB select
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([testSession]),
        });
        
        // Mock DB delete
        vi.mocked(db.delete).mockReturnValue({
          where: vi.fn().mockReturnThis(),
        });

        // Use app to properly handle the request
        const response = await request(app).delete(`/api/chat/history/${testSession.id}`);

        // Verify 204 response
        expect(response.status).toBe(204);
      });

      test('should return 404 if session not found', async () => {
        req.params.sessionId = '999e4567-e89b-12d3-a456-426614174999';
        
        // Mock empty session response
        vi.mocked(db.select).mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        });
        
        vi.mocked(db.select().from).mockReturnValue({
          select: vi.fn().mockReturnValue([]),
        });

        // Use app to properly handle the request
        const response = await request(app).delete('/api/chat/history/999e4567-e89b-12d3-a456-426614174999');

        // Verify 404 response
        expect(response.status).toBe(404);
        expect(response.body.ok).toBe(false);
        expect(response.body.error).toBe('Сессия не найдена');
      });
    });
  });
});