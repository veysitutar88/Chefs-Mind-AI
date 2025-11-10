import 'express-session';

declare module 'express-session' {
  interface SessionData {
    smokeTs?: number;
    // Add other custom session properties here if needed in the future
  }
}
