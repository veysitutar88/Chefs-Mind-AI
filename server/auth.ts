import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { requireWriteConfirm } from "./middleware/safeMode";
import { generateToken, sanitizeUser } from "./utils/jwt";
import { jwtAuthMiddleware } from "./middleware/jwtAuth";

// Создаем расширенный тип пользователя с полями email и role
interface AppUser {
  id: string;
  username: string;
  password: string;
  createdAt: Date | null;
  email: string;
  role: 'admin' | 'chef' | 'accountant';
}

// Расширяем Express.User для нашего приложения
declare global {
  namespace Express {
    interface User extends AppUser {}
  }
}

// Простой кеш пользователей в памяти для deserializeUser
const userCache = new Map<string, { user: AppUser; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(jwtAuthMiddleware);

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        // Создаем объект пользователя с необходимыми полями
        const appUser: AppUser = {
          ...user,
          email: (user as any).email || `${user.username}@chefsmind.ai`,
          role: (user as any).role || 'chef'
        };
        return done(null, appUser);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    // Проверяем кеш
    const cachedEntry = userCache.get(id);
    if (cachedEntry) {
      // Проверяем TTL кеша
      if (Date.now() - cachedEntry.timestamp < CACHE_TTL) {
        return done(null, cachedEntry.user);
      } else {
        // Удаляем устаревший кеш
        userCache.delete(id);
      }
    }

    const user = await storage.getUser(id);
    if (user) {
      // Создаем объект пользователя с необходимыми полями
      const appUser: AppUser = {
        ...user,
        email: (user as any).email || `${user.username}@chefsmind.ai`,
        role: (user as any).role || 'chef'
      };
      
      // Сохраняем в кеш
      userCache.set(id, { user: appUser, timestamp: Date.now() });
      
      done(null, appUser);
    } else {
      done(null, undefined);
    }
  });

  app.post("/api/register", requireWriteConfirm, async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: "Username already exists",
        requestId: req.requestId 
      });
    }

    // Добавляем значения по умолчанию для email и role
    const user = await storage.createUser({
      ...req.body,
      email: req.body.email || `${req.body.username}@chefsmind.ai`,
      role: req.body.role || 'chef',
      password: await hashPassword(req.body.password),
    });

    // Создаем объект пользователя с необходимыми полями
    const appUser: AppUser = {
      id: user.id,
      username: user.username,
      password: user.password,
      createdAt: user.createdAt,
      email: req.body.email || `${user.username}@chefsmind.ai`,
      role: req.body.role || 'chef'
    };

    req.login(appUser, (err) => {
      if (err) return next(err);
      res.status(201).json({ success: true, data: sanitizeUser(user) });
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: "Invalid credentials",
          requestId: req.requestId 
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        const token = generateToken(user);
        const sanitized = sanitizeUser(user);
        res.status(200).json({ 
          success: true, 
          data: { ...sanitized, token },
          requestId: req.requestId 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", requireWriteConfirm, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ 
        success: true, 
        data: { message: "Logged out" }, 
        requestId: req.requestId 
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.user && !req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized",
        requestId: req.requestId 
      });
    }
    res.json({ success: true, data: sanitizeUser(req.user!), requestId: req.requestId });
  });

  app.get("/api/whoami", (req, res) => {
    if (!req.user && !req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        error: "Unauthorized",
        requestId: req.requestId 
      });
    }
    res.json({ success: true, data: sanitizeUser(req.user!), requestId: req.requestId });
  });
}
