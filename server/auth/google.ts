import { google } from 'googleapis';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { dbWrite, dbRead } from '../db.js';
import { googleOAuthTokens, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export type Tokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
};
export interface GoogleAuthStore {
  tokens?: Tokens;
}
const memory: GoogleAuthStore = {};

// Ключ шифрования из переменной окружения
const ENCRYPTION_KEY = process.env.GOOGLE_OAUTH_ENCRYPTION_KEY || 'default-key-change-in-production';

// Функция шифрования
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Функция дешифрования
function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function getOAuth2() {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl() {
  const oauth2 = getOAuth2();
  const scopes = (process.env.GOOGLE_SCOPES || '').split(/\s+/).filter(Boolean);
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

async function getOrCreateUser(email: string, googleId: string): Promise<string> {
  // Проверяем, существует ли пользователь с таким email
  const existingUsers = await dbRead
    .select()
    .from(users)
    .where(eq(users.username, email));

  let userId: string;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    // Создаем нового пользователя
    const insertedUsers = await dbWrite
      .insert(users)
      .values({
        username: email,
        password: googleId, // Для Google OAuth используем Google ID как пароль
      })
      .returning();
    userId = insertedUsers[0].id;
  }

  return userId;
}

async function saveTokensToDB(userId: string, tokens: Tokens, googleProfile: any) {
  const refreshTokenEncrypted = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;
  
  // Проверяем, есть ли уже токены для этого пользователя
  const existingTokens = await dbRead
    .select()
    .from(googleOAuthTokens)
    .where(eq(googleOAuthTokens.userId, userId));

  if (existingTokens.length > 0) {
    // Обновляем существующие токены
    await dbWrite
      .update(googleOAuthTokens)
      .set({
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        refreshTokenEncrypted: refreshTokenEncrypted,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: googleProfile.scope,
        updatedAt: new Date(),
      })
      .where(eq(googleOAuthTokens.userId, userId));
  } else {
    // Создаем новую запись
    await dbWrite
      .insert(googleOAuthTokens)
      .values({
        userId,
        googleId: googleProfile.id,
        email: googleProfile.email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        refreshTokenEncrypted: refreshTokenEncrypted,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: googleProfile.scope,
      });
  }
}

export async function handleCallback(req: Request, _res: Response) {
  const code = String(req.query.code || '');
  const oauth2 = getOAuth2();
  const { tokens } = await oauth2.getToken(code);
  
  // Получаем профиль пользователя
  oauth2.setCredentials(tokens);
  const oauth2Api = google.oauth2({ version: 'v2', auth: oauth2 });
  const profileResponse = await oauth2Api.userinfo.get();
  const googleProfile = profileResponse.data;

  if (!googleProfile.email || !googleProfile.id) {
    throw new Error('Не удалось получить профиль Google пользователя');
  }

  // Создаем или получаем пользователя
  const userId = await getOrCreateUser(googleProfile.email, googleProfile.id);
  
  // Сохраняем токены в БД
  await saveTokensToDB(userId, tokens, googleProfile);
  
  // Сохраняем в памяти для обратной совместимости
  memory.tokens = tokens;
  
  return tokens;
}

export function authedOAuth2() {
  const oauth2 = getOAuth2();
  if (memory.tokens) oauth2.setCredentials(memory.tokens);
  return oauth2;
}

export function ensureAuthed(req: Request, res: Response, next: NextFunction) {
  if (
    process.env.GOOGLE_AUTH_SMOKE_BYPASS === '1' &&
    req.header('X-Smoke-Google-Auth') === 'yes'
  ) {
    return next();
  }
  if (!memory.tokens?.access_token && !memory.tokens?.refresh_token) {
    return res.status(401).json({ ok: false, code: 'GOOGLE_NOT_AUTHED' });
  }
  return next();
}

async function getTokensFromDB() {
  try {
    // Получаем первую запись токенов из БД (для совместимости)
    const tokens = await dbRead
      .select()
      .from(googleOAuthTokens)
      .limit(1);
    
    if (tokens.length === 0) {
      return null;
    }
    
    const tokenRecord = tokens[0];
    return {
      access_token: tokenRecord.accessToken,
      refresh_token: tokenRecord.refreshToken,
      expiry_date: tokenRecord.expiryDate ? tokenRecord.expiryDate.getTime() : null,
    };
  } catch (error) {
    console.error('Ошибка при получении токенов из БД:', error);
    return null;
  }
}

export async function authStatus() {
  const memoryTokens = memory.tokens;

  const hasTokens = !!memoryTokens?.access_token;
  const hasRefresh = !!memoryTokens?.refresh_token;

  // Синхронная проверка БД
  let storedInDb = false;
  let dbHasTokens = false;
  let dbTokens = null;

  try {
    dbTokens = await getTokensFromDB();
    storedInDb = !!dbTokens;
    dbHasTokens = !!dbTokens?.access_token;
    // Логирование для отладки
    if (storedInDb) {
      console.log('Найдены токены в базе данных');
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса в БД:', error);
  }

  return {
    ok: hasTokens,
    has_refresh: hasRefresh,
    expiry_date: memoryTokens?.expiry_date || null,
    stored_in_db: storedInDb,
    memory_has_tokens: !!memoryTokens?.access_token,
    db_has_tokens: dbHasTokens,
  };
}

export async function logout() {
  // Очищаем память
  memory.tokens = undefined;
  
  try {
    // Удаляем токены из БД (все записи)
    await dbWrite.delete(googleOAuthTokens).where(sql`1=1`);
    console.log('Токены успешно удалены из базы данных');
  } catch (error) {
    console.error('Ошибка при удалении токенов из БД:', error);
    // Не бросаем ошибку, так как очистка памяти уже выполнена
  }
}
