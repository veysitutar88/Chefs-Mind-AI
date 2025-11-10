import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import app from '../../server/enhanced-server';

describe('Metrics Endpoint', () => {
  let server: any;

  beforeAll(() => {
    server = createServer(app);
  });

  afterAll(() => {
    server.close();
  });

  it('should return 200 and contain http_requests_total for GET /metrics', async () => {
    const response = await request(server).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.text).toContain('http_requests_total');
  });
});