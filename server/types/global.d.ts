// Global type declarations for missing modules
declare module 'passport' {
  const passport: any;
  export = passport;
}

declare module 'passport-local' {
  const passportLocal: any;
  export = passportLocal;
  export const Strategy: any;
}

declare module 'express-session' {
  const expressSession: any;
  export = expressSession;
  export interface Session {
    id: string;
    [key: string]: any;
  }
  export interface SessionData {
    userId: string;
    [key: string]: any;
  }
}

declare module 'connect-pg-simple' {
  const connectPgSimple: any;
  export = connectPgSimple;
}

declare module 'pg-format' {
  const pgFormat: any;
  export = pgFormat;
}

declare module 'morgan' {
  const morgan: any;
  export = morgan;
}

declare module 'swagger-ui-express' {
  const swaggerUiExpress: any;
  export = swaggerUiExpress;
}

declare module 'ws' {
  const WebSocket: any;
  export default WebSocket;
}

declare module 'vite' {
  const vite: any;
  export = vite;
  export function createServer(options?: any): any;
  export function createLogger(options?: any): any;
}

declare module 'vitest' {
  const vitest: any;
  export = vitest;
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const vi: any;
  export const beforeAll: any;
}

// Extended Express types for passport integration
declare global {
  namespace Express {
    interface Request {
      user?: any;
      login?(user: any, callback?: (err: any) => void): void;
      logout?(callback?: (err: any) => void): void;
      isAuthenticated?(): boolean;
      session?: any;
    }
  }
  
  namespace session {
    interface Session {
      id: string;
      [key: string]: any;
    }
    interface SessionData {
      userId: string;
      [key: string]: any;
    }
  }
}