import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { storage } from "../storage.js";

// Создаем расширенный тип пользователя с полями email и role
interface AppUser {
  id: string;
  username: string;
  password: string;
  createdAt: Date | null;
  email: string;
  role: 'admin' | 'chef' | 'accountant';
}

// Простой кеш пользователей в памяти
const userCache = new Map<string, AppUser>();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export async function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return next();
  }

  try {
    // Проверяем кеш
    const cachedUser = userCache.get(payload.userId);
    if (cachedUser) {
      // Проверяем TTL кеша
      if (Date.now() - (cachedUser as any).cachedAt < CACHE_TTL) {
        req.user = cachedUser as any;
        return next();
      } else {
        // Удаляем устаревший кеш
        userCache.delete(payload.userId);
      }
    }

    const user = await storage.getUser(payload.userId);
    if (user) {
      // Создаем объект пользователя с необходимыми полями
      const appUser: AppUser = {
        ...user,
        email: (user as any).email || `${user.username}@chefsmind.ai`,
        role: (user as any).role || 'chef'
      };
      // Сохраняем в кеш
      userCache.set(payload.userId, { ...appUser, cachedAt: Date.now() } as any);
      req.user = appUser as any;
    }
  } catch (error) {
    console.error("JWT auth error:", error);
  }

  next();
}
