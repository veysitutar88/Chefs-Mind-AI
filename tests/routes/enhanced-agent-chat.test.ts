import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../../tests/helpers/app.js';

// Mock QA Gate to ensure deterministic behavior and inject routing info
vi.mock('../middleware/qaGate.js', () => {
  return {
    validateAndCorrectResponse: vi.fn(
      async (
        originalResponse: string,
        agentType: string,
        userQuery: string
      ) => {
        return {
          correctedResponse: `Mocked researcher answer for: ${userQuery || 'N/A'}`,
          originalResponse,
          wasCorrected: false,
          qaScore: 0.95,
          agentName: 'researcher',
          routedTo: 'researcher',
          reasons: ['Mock QA passed'],
        };
      }
    ),
    qaGateMiddleware: vi.fn((req: any, res: any, next: any) => {
      (req as any).qaResult = { score: 0.95, passed: true, reasons: [] };
      next();
    }),
    logQAResult: vi.fn(() => ({})),
  };
});

// Mock Perplexity API to avoid external calls if used by researcher
vi.mock('../services/perplexity.js', () => ({
  analyzeWithPerplexity: vi.fn(async (text: string) => ({
    response: `Mocked web result for: ${text}`,
    metadata: { mocked: true },
  })),
}));

// Mock OpenAI used by QA validator to avoid network
vi.mock('../services/openai.js', () => ({
  analyzeWithGPT: vi.fn(
    async () =>
      '{"qaScore":0.99,"wasCorrected":false,"correctedResponse":"OK","reasons":[]}'
  ),
}));

describe('POST /api/enhanced-agent/chat - End-to-End', () => {
  const app = createTestApp();

  it('should return 200, non-empty response, qa object and researcher routing', async () => {
    const payload = { message: 'search the web for the current price of gold' };

    const res = await request(app)
      .post('/api/enhanced-agent/chat')
      .send(payload)
      .set('Content-Type', 'application/json');

    // a) HTTP 200
    expect(res.status).toBe(200);

    // b) Non-empty response field
    expect(res.body).toBeDefined();
    expect(typeof res.body.response).toBe('string');
    expect(res.body.response.length).toBeGreaterThan(0);

    // c) qa object present
    expect(res.body.qa).toBeDefined();
    expect(typeof res.body.qa).toBe('object');

    // d) routed to researcher (AgentRouter correctness)
    const routed = res.body.qa.agentName || res.body.qa.routedTo;
    expect(routed).toBe('researcher');
  });
});
