import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import { app } from '../../server/enhanced-server';

describe('Health Check Endpoint', () => {
  let server: any;

  beforeAll(() => {
    server = createServer(app);
  });

  afterAll(() => {
    server.close();
  });

  it('should return 200 and { ok: true } for GET /health', async () => {
    const response = await request(server).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
