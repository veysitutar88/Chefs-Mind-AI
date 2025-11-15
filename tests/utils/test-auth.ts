/**
 * Утилиты для тестирования аутентификации
 * Предоставляет функции для создания тестовых пользователей и управления токенами
 */

import { APIRequestContext } from '@playwright/test';

/**
 * Тип для параметров создания тестового пользователя
 */
interface TestUserOptions {
  email?: string;
  role?: 'admin' | 'chef' | 'accountant' | 'viewer';
}

/**
 * Тип для тестового пользователя
 */
interface TestUser {
  token: string;
  confirmCode: string;
  role: 'admin' | 'chef' | 'accountant' | 'viewer';
  id: string;
}

/**
 * Получает тестового пользователя с нужными правами и возможностями
 * @param apiContext - контекст запроса Playwright
 * @param options - параметры для создания тестового пользователя
 * @returns объект с информацией о тестовом пользователе и его токенами
 */
export async function getTestUser(
  apiContext: APIRequestContext,
  options: TestUserOptions = {}
): Promise<TestUser> {
  const { email = 'test@example.com', role = 'admin' } = options;
  
  // В реальном приложении здесь бы происходила аутентификация
  // Для тестовых целей мы создаем фиктивный токен и код подтверждения
  
  const token = `test-token-${role}-${Date.now()}`;
  const confirmCode = `test-confirm-code-${Date.now()}`;
  const id = `test-user-${Date.now()}`;
  
  return {
    token,
    confirmCode,
    role,
    id
  };
}