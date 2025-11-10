import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';

describe('GET /health - Health Check Endpoint', () => {
  const app = createTestApp();

  it('should return a 200 OK status and a JSON body', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('should contain an "ok: true" property in the response body', async () => {
    const response = await request(app).get('/health');
    expect(response.body.ok).toBe(true);
  });

  it('should contain a valid "uptime" property', async () => {
    const response = await request(app).get('/health');
    expect(response.body.uptime).toBeDefined();
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThan(0);
  });
});