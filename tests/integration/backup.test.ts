import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import app from '@/server/enhanced-server';

describe('Backup Endpoint', () => {
  let server: any;

  beforeAll(() => {
    server = createServer(app);
  });

  afterAll(() => {
    server.close();
  });

  it('should return 401 or 403 for POST /api/db/backup without X-Confirm-Code', async () => {
    const response = await request(server).post('/api/db/backup');
    expect([401, 403]).toContain(response.status);
  });
});
