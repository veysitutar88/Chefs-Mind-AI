import { test, expect, request } from '@playwright/test';
import { getTestUser } from '../utils/test-auth';

const API_URL = process.env.BASE_URL || 'http://localhost:5001';

test.describe('API: Chat History End-to-End Tests', () => {
  let apiContext;
  let testUser;
  let testSession;
  
  // Инициализация тестового контекста и пользователя
  test.beforeAll(async ({ browser }) => {
    apiContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    // Получаем тестового пользователя
    testUser = await getTestUser(apiContext);
    
    // Создаем тестовую сессию для дальнейшего использования
    const sessionResponse = await apiContext.post('/api/chat/history', {
      data: { agentType: 'chef', title: 'Test Session' },
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(sessionResponse.status()).toBe(201);
    const sessionData = await sessionResponse.json();
    testSession = sessionData.data;
  });

  // Очистка после выполнения тестов
  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // Тест на успешное получение списка сессий
  test('GET /api/chat/history - успешное получение списка сессий', async () => {
    const response = await apiContext.get('/api/chat/history', {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data).toHaveProperty('sessions');
    expect(data.data).toHaveProperty('messages');
    expect(data.data).toHaveProperty('totalSessions');
    expect(data.data).toHaveProperty('totalMessages');
    expect(data.data).toHaveProperty('page');
    expect(data.data).toHaveProperty('limit');
  });

  // Тест на фильтрацию по типу агента
  test('GET /api/chat/history - фильтрация по типу агента', async () => {
    const response = await apiContext.get('/api/chat/history?agentType=chef', {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    // Проверяем, что все сессии имеют указанный тип агента
    for (const session of data.data.sessions) {
      expect(session.agentType).toBe('chef');
    }
  });

  // Тест на пагинацию
  test('GET /api/chat/history - пагинация', async () => {
    const response = await apiContext.get('/api/chat/history?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data.sessions).toHaveLength(5);
    expect(data.data.page).toBe(1);
    expect(data.data.limit).toBe(5);
  });

  // Тест на получение сообщений для конкретной сессии
  test('GET /api/chat/history/:sessionId - успешное получение сообщений', async () => {
    const response = await apiContext.get(`/api/chat/history/${testSession.id}`, {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data).toHaveProperty('session');
    expect(data.data).toHaveProperty('messages');
    expect(data.data).toHaveProperty('total');
    expect(data.data).toHaveProperty('page');
    expect(data.data).toHaveProperty('limit');
    
    // Проверяем, что сессия соответствует запрошенной
    expect(data.data.session.id).toBe(testSession.id);
  });

  // Тест на пагинацию сообщений
  test('GET /api/chat/history/:sessionId - пагинация сообщений', async () => {
    const response = await apiContext.get(`/api/chat/history/${testSession.id}?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data.page).toBe(1);
    expect(data.data.limit).toBe(10);
  });

  // Тест на создание новой сессии
  test('POST /api/chat/history - успешное создание сессии', async () => {
    const newSession = {
      agentType: 'chef',
      title: 'New Test Session'
    };
    
    const response = await apiContext.post('/api/chat/history', {
      data: newSession,
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'X-Confirm-Code': testUser.confirmCode
      }
    });
    
    expect(response.status()).toBe(201);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('userId');
    expect(data.data).toHaveProperty('agentType');
    expect(data.data).toHaveProperty('title');
    expect(data.data).toHaveProperty('status');
    expect(data.data).toHaveProperty('createdAt');
    expect(data.data).toHaveProperty('updatedAt');
    
    // Проверяем значения
    expect(data.data.agentType).toBe(newSession.agentType);
    expect(data.data.title).toBe(newSession.title);
    expect(data.data.status).toBe('active');
  });

  // Тест на создание сессии с дефолтным заголовком
  test('POST /api/chat/history - создание сессии с дефолтным заголовком', async () => {
    const newSession = {
      agentType: 'accountant'
    };
    
    const response = await apiContext.post('/api/chat/history', {
      data: newSession,
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'X-Confirm-Code': testUser.confirmCode
      }
    });
    
    expect(response.status()).toBe(201);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data.title).toBe('Новая сессия чата');
  });

  // Тест на обновление сессии
  test('PUT /api/chat/history/:sessionId - успешное обновление сессии', async () => {
    const updateData = {
      title: 'Updated Test Session',
      status: 'closed'
    };
    
    const response = await apiContext.put(`/api/chat/history/${testSession.id}`, {
      data: updateData,
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'X-Confirm-Code': testUser.confirmCode
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.data.title).toBe(updateData.title);
    expect(data.data.status).toBe(updateData.status);
  });

  // Тест на удаление сессии
  test('DELETE /api/chat/history/:sessionId - успешное удаление сессии', async () => {
    // Создаем сессию для удаления
    const sessionResponse = await apiContext.post('/api/chat/history', {
      data: { agentType: 'chef', title: 'Session to delete' },
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'X-Confirm-Code': testUser.confirmCode
      }
    });
    
    const sessionData = await sessionResponse.json();
    const sessionToDelete = sessionData.data;
    
    // Удаляем сессию
    const deleteResponse = await apiContext.delete(`/api/chat/history/${sessionToDelete.id}`, {
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'X-Confirm-Code': testUser.confirmCode
      }
    });
    
    expect(deleteResponse.status()).toBe(204);
    
    // Проверяем, что сессия действительно удалена
    const getResponse = await apiContext.get(`/api/chat/history/${sessionToDelete.id}`, {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(getResponse.status()).toBe(404);
  });

  // Тест на обработку ошибок аутентификации
  test('Неавторизованный доступ - 401 ошибка', async () => {
    const response = await apiContext.get('/api/chat/history');
    
    expect(response.status()).toBe(401);
    const data = await response.json();
    
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  // Тест на обработку ошибок валидации
  test('POST /api/chat/history - ошибка валидации при неверных данных', async () => {
    const invalidSession = {
      agentType: 'invalid_agent',
      title: 123
    };
    
    const response = await apiContext.post('/api/chat/history', {
      data: invalidSession,
      headers: {
        'Authorization': `Bearer ${testUser.token}`,
        'X-Confirm-Code': testUser.confirmCode
      }
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Ошибка валидации данных');
    expect(data.details).toBeDefined();
  });

  // Тест на обработку ошибок при доступе к чужой сессии
  test('Доступ к чужой сессии - 404 ошибка', async () => {
    // Создаем сессию для другого пользователя
    const otherUser = await getTestUser(apiContext, { email: 'test2@example.com' });
    
    const sessionResponse = await apiContext.post('/api/chat/history', {
      data: { agentType: 'chef', title: 'Other User Session' },
      headers: {
        'Authorization': `Bearer ${otherUser.token}`,
        'X-Confirm-Code': otherUser.confirmCode
      }
    });
    
    const sessionData = await sessionResponse.json();
    const otherSession = sessionData.data;
    
    // Пытаемся получить доступ к чужой сессии
    const response = await apiContext.get(`/api/chat/history/${otherSession.id}`, {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Сессия не найдена');
  });

  // Тест на SafeMode (требуется X-Confirm-Code)
  test('POST /api/chat/history - требуется X-Confirm-Code для создания', async () => {
    const newSession = {
      agentType: 'chef',
      title: 'Test Session'
    };
    
    const response = await apiContext.post('/api/chat/history', {
      data: newSession,
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(403);
    const data = await response.json();
    
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Подтверждение записи требуется');
  });

  // Тест на RBAC (требуется соответствующая роль)
  test('GET /api/chat/history - требуется роль chef/accountant/admin', async () => {
    // Создаем пользователя с ролью viewer
    const viewerUser = await getTestUser(apiContext, { role: 'viewer' });
    
    const response = await apiContext.get('/api/chat/history', {
      headers: {
        'Authorization': `Bearer ${viewerUser.token}`
      }
    });
    
    expect(response.status()).toBe(403);
    const data = await response.json();
    
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Доступ запрещен');
  });

  // Тест на работу с некорректным UUID
  test('GET /api/chat/history/:invalid-uuid - ошибка при некорректном UUID', async () => {
    const response = await apiContext.get('/api/chat/history/invalid-uuid', {
      headers: {
        'Authorization': `Bearer ${testUser.token}`
      }
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Ошибка валидации параметров запроса');
  });
});