import { pool } from '../db';

// Simple in-memory cache for table list (10 minute TTL)
interface TableCacheEntry {
  tables: string[];
  expiresAt: number;
}

let tableCache: TableCacheEntry | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getAvailableTables(): Promise<string[]> {
  // Check cache first
  if (tableCache && tableCache.expiresAt > Date.now()) {
    return tableCache.tables;
  }

  // Fetch from database
  const tablesQuery = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND (table_name LIKE 'imported_%' OR table_name IN ('ingredients', 'recipes', 'invoices', 'users', 'chat_sessions', 'messages'))"
  );
  
  const tables = tablesQuery.rows.map(row => row.table_name);

  // Cache the result
  tableCache = {
    tables,
    expiresAt: Date.now() + CACHE_TTL_MS
  };

  return tables;
}

// Clear cache when tables change (called after upload processing)
export function clearTableCache(): void {
  tableCache = null;
}
