import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();
// ВАЖНО: для алиаса @shared/schema расширение .js НЕ добавляем
import * as schema from '@shared/schema';
import { Pool } from 'pg';

const writeClient = postgres(process.env.DATABASE_URL!);
const readClient = postgres(
  process.env.DATABASE_READONLY_URL || process.env.DATABASE_URL!
);

export const dbWrite = drizzle(writeClient, { schema });
export const dbRead = drizzle(readClient, { schema });
export const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
