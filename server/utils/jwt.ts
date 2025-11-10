import jwt from 'jsonwebtoken';
import { User } from '@shared/schema.js';

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback-secret-for-dev';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  username: string;
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export function sanitizeUser(user: User) {
  const { password, ...safeUser } = user;
  return safeUser;
}
