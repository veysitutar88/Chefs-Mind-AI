import session from 'express-session';
import type { RequestHandler } from 'express';
import { createClient } from 'redis';
import RedisStorePkg from 'connect-redis';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db.js';
import { log } from './utils/log.js';
import { env as appEnv } from './index.js';

type Env = 'production' | 'development';

type CookieOpts = { secure?: boolean | 'auto'; sameSite?: boolean | string; domain?: string; [key: string]: unknown };

export function cookieInfoForLog(c: CookieOpts) {
  return `secure=${!!(c as any).secure}, sameSite=${(c as any).sameSite ?? 'unset'}, domain=${(c as any).domain ?? 'unset'}, name=${process.env.SESSION_NAME ?? 'sid'}`;
}

export async function buildSession(env: Env): Promise<RequestHandler> {
  log(
    `[session] Building session store for ${env} environment`,
    'info',
    'session'
  );

  if (env === 'production') {
    const allowPgInProd = process.env.ALLOW_NONREDIS_IN_PROD === 'true';
    if (allowPgInProd) {
      const PgStore = connectPgSimple(session);
      const store = new PgStore({
        pool,
        tableName: 'session',
        createTableIfMissing: true,
      });
      log(
        '[session][postgres] ALLOW_NONREDIS_IN_PROD=true: Using PostgresSessionStore for production fallback',
        'warn',
        'session'
      );

      const sessionConfig = {
        store,
        secret: appEnv.SESSION_SECRET,
        name: 'sid',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          sameSite: 'lax' as const,
          secure: true, // still require Secure cookies in prod-like
          domain:
            appEnv.NODE_ENV === 'production' ? '.chefsmind.ai' : undefined,
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
      };

      log(
        `[session][postgres] Using store=${(store as any).constructor.name}, secure=${sessionConfig.cookie.secure}, domain=${sessionConfig.cookie.domain}, env=production`,
        'info',
        'session'
      );

      const cookieOpts = sessionConfig.cookie as CookieOpts;
      const middleware = session(sessionConfig);
      log(
        `[sessions] store=${(store as any).constructor.name}, ${cookieInfoForLog(cookieOpts)}, env=${env}`,
        'info',
        'session'
      );
      return middleware;
    }

    const redisURL = process.env.REDIS_URL as string; // e.g. rediss://user:pass@host:6380/0
    const host = new URL(redisURL).hostname;
    if (!redisURL) {
      log(
        '[session][redis] REDIS_URL is required in production environment',
        'error',
        'session'
      );
      throw new Error('REDIS_URL is required in production');
    }

    const redisClient = createClient({ url: redisURL });

    redisClient.on('connect', () =>
      log('[session][redis] Client connected', 'info', 'session')
    );
    redisClient.on('ready', () => {
      log('[session][redis] Client ready', 'info', 'session');
      log(`[redis] client ready host=${host}`, 'info', 'session');
    });
    redisClient.on('reconnecting', () =>
      log('[session][redis] Client reconnecting', 'warn', 'session')
    );
    redisClient.on('end', () =>
      log('[session][redis] Client disconnected', 'info', 'session')
    );
    redisClient.on('error', err =>
      log(
        `[session][redis] Client error: ${err?.message ?? ''}`,
        'error',
        'session'
      )
    );

    await redisClient.connect();
    log(
      `[session][redis] Successfully connected to Redis at ${redisURL}`,
      'info',
      'session'
    );

    const RedisStore = RedisStorePkg; // connect-redis v6+ exposes default class explicitly
    const store = new RedisStore({ client: redisClient });
    if (store.constructor.name !== 'RedisStore') {
      log(
        '[sessions] FATAL: MemoryStore or non-Redis store detected in production',
        'error',
        'session'
      );
      process.exit(1);
    }
    log('[session][redis] Using RedisStore', 'info', 'session');

    const sessionConfig = {
      store,
      secret: appEnv.SESSION_SECRET,
      name: 'sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: appEnv.NODE_ENV === 'production',
        domain: appEnv.NODE_ENV === 'production' ? '.chefsmind.ai' : undefined,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    };

    log(
      `[session][redis] Using store=${store.constructor.name}, secure=${sessionConfig.cookie.secure}, domain=${sessionConfig.cookie.domain}, env=production`,
      'info',
      'session'
    );

    const cookieOpts = sessionConfig.cookie as CookieOpts;
    const middleware = session(sessionConfig);
    log(
      `[sessions] store=${store.constructor.name}, ${cookieInfoForLog(cookieOpts)}, env=${env}`,
      'info',
      'session'
    );
    return middleware;
  } else {
    // Development environment using PostgreSQL for session storage
    const PgStore = connectPgSimple(session);
    const store = new PgStore({
      pool, // Use the existing PG pool
      tableName: 'session',
      createTableIfMissing: true,
    });
    log(
      '[session][postgres] Using PostgresSessionStore for development environment',
      'info',
      'session'
    );

    const sessionConfig = {
      store,
      secret: appEnv.SESSION_SECRET,
      name: 'sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax' as const,
        secure: appEnv.NODE_ENV === 'production',
        domain: appEnv.NODE_ENV === 'production' ? '.chefsmind.ai' : undefined,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    };

    log(
      `[session][postgres] Using store=${(store as any).constructor.name}, secure=${sessionConfig.cookie.secure}, env=development`,
      'info',
      'session'
    );

    const cookieOpts = sessionConfig.cookie as CookieOpts;
    const middleware = session(sessionConfig);
    log(
      `[sessions] store=${(store as any).constructor.name}, ${cookieInfoForLog(cookieOpts)}, env=${env}`,
      'info',
      'session'
    );
    return middleware;
  }
}
