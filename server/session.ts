import session from 'express-session';
import type { RequestHandler } from 'express';
import { createClient } from 'redis';
import RedisStorePkg from 'connect-redis';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';
import { log } from './utils/log';

type Env = 'production' | 'development';

export async function buildSession(env: Env): Promise<Handler> {
  log(`[session] Building session store for ${env} environment`, 'info', 'session');

  if (env === 'production') {
    const redisURL = process.env.REDIS_URL as string; // e.g. rediss://user:pass@host:6380/0
    if (!redisURL) {
      log('[session][redis] REDIS_URL is required in production environment', 'error', 'session');
      throw new Error('REDIS_URL is required in production');
    }

    const redisClient = createClient({ url: redisURL });
    
    redisClient.on('connect', () => log('[session][redis] Client connected', 'info', 'session'));
    redisClient.on('ready', () => log('[session][redis] Client ready', 'info', 'session'));
    redisClient.on('reconnecting', () => log('[session][redis] Client reconnecting', 'warn', 'session'));
    redisClient.on('end', () => log('[session][redis] Client disconnected', 'info', 'session'));
    redisClient.on('error', (err) => log(`[session][redis] Client error: ${err?.message ?? ''}`, 'error', 'session', err));
    
    await redisClient.connect();
    log(`[session][redis] Successfully connected to Redis at ${redisURL}`, 'info', 'session');

    const RedisStore = RedisStorePkg; // connect-redis v6+ exposes default class explicitly
    const store = new RedisStore({ client: redisClient });
    log('[session][redis] Using RedisStore', 'info', 'session');

    const sessionConfig = {
      store,
      secret: process.env.SESSION_SECRET || 'change_me',
      name: 'sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: true, // requires trust proxy & TLS at the edge
        domain: process.env.COOKIE_DOMAIN || '.chefsmind.ai',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      },
    };
    
    log(`[session][redis] Using store=${store.constructor.name}, secure=${sessionConfig.cookie.secure}, domain=${sessionConfig.cookie.domain}, env=production`, 'info', 'session');
    
    return session(sessionConfig);
  } else {
    // Development environment using PostgreSQL for session storage
    const PgStore = connectPgSimple(session);
    const store = new PgStore({
      pool, // Use the existing PG pool
      tableName: 'session',
      createTableIfMissing: true,
    });
    log('[session][postgres] Using PostgresSessionStore for development environment', 'info', 'session');
    
    const sessionConfig = {
      store,
      secret: process.env.SESSION_SECRET || 'dev_only',
      name: 'sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // In development, HTTPS might not be configured
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    };

    log(`[session][postgres] Using store=${(store as any).constructor.name}, secure=${sessionConfig.cookie.secure}, env=development`, 'info', 'session');

    return session(sessionConfig);
  }
}